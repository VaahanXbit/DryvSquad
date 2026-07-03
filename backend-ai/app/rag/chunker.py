from bs4 import BeautifulSoup
import re

from app.db.mongodb import articles_collection


def recursive_split_text(text: str, chunk_size: int = 900, chunk_overlap: int = 150) -> list[str]:
    """
    Split text recursively by paragraphs, lines, sentences, and words to maintain cohesive chunks
    that respect a maximum size and overlap limit.
    """
    separators = ["\n\n", "\n", ". ", " ", ""]
    
    def split(text_to_split: str, separators: list[str]) -> list[str]:
        if len(text_to_split) <= chunk_size:
            return [text_to_split]
            
        if not separators:
            # Force character split if all separators exhausted
            return [text_to_split[i:i+chunk_size] for i in range(0, len(text_to_split), chunk_size)]
            
        separator = separators[0]
        splits = []
        if separator == "":
            splits = list(text_to_split)
        else:
            splits = text_to_split.split(separator)
            
        chunks = []
        current_chunk = []
        current_len = 0
        
        for item in splits:
            item_len = len(item)
            # If the item itself exceeds chunk_size, split it recursively
            if item_len > chunk_size:
                if current_chunk:
                    chunks.append(separator.join(current_chunk))
                    current_chunk = []
                    current_len = 0
                chunks.extend(split(item, separators[1:]))
            else:
                sep_len = len(separator) if current_chunk else 0
                if current_len + sep_len + item_len <= chunk_size:
                    current_chunk.append(item)
                    current_len += sep_len + item_len
                else:
                    if current_chunk:
                        chunks.append(separator.join(current_chunk))
                    
                    # Backtrack to satisfy overlap constraints
                    overlap_items = []
                    overlap_len = 0
                    for prev_item in reversed(current_chunk):
                        prev_sep_len = len(separator) if overlap_items else 0
                        if overlap_len + prev_sep_len + len(prev_item) <= chunk_overlap:
                            overlap_items.insert(0, prev_item)
                            overlap_len += prev_sep_len + len(prev_item)
                        else:
                            break
                    current_chunk = overlap_items + [item]
                    current_len = overlap_len + (len(separator) if overlap_items else 0) + item_len
                    
        if current_chunk:
            chunks.append(separator.join(current_chunk))
            
        return chunks

    return split(text, separators)


def chunk_article(article):
    base_chunk = {
        "source_type": "article",
        "source_id": str(article["_id"]),
        "title": article["title"],
        "slug": article.get("slug", ""),
        "category": article.get("category", ""),
        "tags": article.get("tags", []),
        "excerpt": article.get("excerpt", "")
    }

    content_html = article.get("content", "")

    if not content_html:
        return [{
            **base_chunk,
            "chunk_id": f"article_{article['_id']}_chunk_0",
            "chunk_text": f"[Article: {article['title']} | Category: {article.get('category', 'Tech Insights')}] {article.get('excerpt', '')}",
            "chunk_index": 0
        }]

    soup = BeautifulSoup(content_html, "html.parser")
    has_html_structure = soup.find(["h2", "h3", "p", "ul", "li"]) is not None

    if has_html_structure:
        sections = []
        current_heading = article["title"]
        current_content = []

        for element in soup.find_all(["h2", "h3", "p", "ul", "li"]):
            if element.name in ["h2", "h3"]:
                if current_content:
                    sections.append(f"{current_heading}. {' '.join(current_content)}")
                current_heading = element.get_text(strip=True)
                current_content = []
            else:
                text = element.get_text(" ", strip=True)
                if len(text) > 20:
                    current_content.append(text)

        if current_content:
            sections.append(f"{current_heading}. {' '.join(current_content)}")
            
        full_text = "\n\n".join(sections)
    else:
        # Fallback for plain text/PDF extracted text
        full_text = re.sub(r'\s*\n\s*\n\s*', '\n\n', content_html).strip()
        full_text = re.sub(r' +', ' ', full_text)

    # Split the full text recursively using 900 max characters chunk size, with 150 characters overlap
    raw_chunks = recursive_split_text(full_text, chunk_size=900, chunk_overlap=150)
    
    chunks = []
    for index, text in enumerate(raw_chunks):
        text = text.strip()
        if len(text) < 30:
            continue
            
        # Context Injection: prepend main title and category directly to the chunk text
        context_prefix = f"[Article: {article['title']} | Category: {article.get('category', 'Tech Insights')}] "
        final_chunk_text = context_prefix + text
        
        chunks.append({
            **base_chunk,
            "chunk_id": f"article_{article['_id']}_chunk_{index}",
            "chunk_text": final_chunk_text,
            "chunk_index": index
        })

    return chunks


def chunk_articles():
    chunks = []

    for article in articles_collection.find():
        chunks.extend(chunk_article(article))

    return chunks


if __name__ == "__main__":
    chunks = chunk_articles()

    print(f"✅ Total chunks created: {len(chunks)}")

    if chunks:
        print("\n--- Sample Chunk ---")
        print(f"chunk_id: {chunks[0]['chunk_id']}")
        print(f"title: {chunks[0]['title']}")
        print(f"chunk_text: {chunks[0]['chunk_text'][:200]}")