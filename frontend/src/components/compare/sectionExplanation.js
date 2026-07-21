// src/components/compare/sectionExplanation.js
/*
================================================================================
File Name : sectionExplanation.js
Description : Builds section-level explanation data from backend response.
              Uses existing explanation objects from ratingService.
              No AI labels, no winners, no buying insights.
================================================================================
*/

/**
 * Build section explanation from backend data
 * @param {Object} section - Section data from backend
 * @param {Array} cars - Array of car objects with {car, slot, position}
 * @returns {Object} Formatted section explanation with rows, definitions, summaries
 */
export function buildSectionExplanation(section, cars) {
  if (!section || !section.rows || section.rows.length === 0) {
    return {
      key: section?.key || 'unknown',
      label: section?.label || 'Section',
      icon: section?.icon || '📋',
      rows: [],
      introduction: null,
      overallSummary: null
    }
  }

  // Build parameter explanations
  const rows = section.rows.map(row => {
    // Skip info rows (no rating, no explanation needed)
    if (row.type === 'info') {
      return {
        key: row.key,
        label: row.label,
        icon: row.icon,
        type: 'info',
        car1: { name: cars[0]?.car?.brand + ' ' + cars[0]?.car?.model || 'Car 1', value: row.byPosition?.[1]?.value || 'N/A' },
        car2: { name: cars[1]?.car?.brand + ' ' + cars[1]?.car?.model || 'Car 2', value: row.byPosition?.[2]?.value || 'N/A' },
        definition: null,
        comparisonSummary: null
      }
    }

    // Get car names
    const car1Name = `${cars[0]?.car?.brand} ${cars[0]?.car?.model}` || 'Car 1'
    const car2Name = `${cars[1]?.car?.brand} ${cars[1]?.car?.model}` || 'Car 2'

    // Get cell data for each car
    const car1Data = row.byPosition?.[1] || null
    const car2Data = row.byPosition?.[2] || null

    // Get explanations from backend
    const car1Explanation = car1Data?.explanation || null
    const car2Explanation = car2Data?.explanation || null

    // Build parameter definition from backend or use default
    let definition = null
    if (row.definition) {
      definition = row.definition
    } else if (car1Explanation?.definition) {
      definition = car1Explanation.definition
    } else if (car2Explanation?.definition) {
      definition = car2Explanation.definition
    } else {
      // Fallback generic definitions
      const defs = {
        'Ground Clearance': 'Distance between the lowest point of the vehicle and the road',
        'Turning Radius': 'Diameter of the smallest circle the vehicle can complete a U-turn in',
        'Fuel Efficiency': 'Distance traveled per unit of fuel under standard conditions',
        'Power': 'Maximum power output of the engine',
        'Torque': 'Twisting force produced by the engine',
        'Boot Space': 'Usable luggage capacity behind the rear seats',
        'Length': 'Overall length of the vehicle',
        'Width': 'Overall width of the vehicle',
        'Height': 'Overall height of the vehicle',
        'Wheelbase': 'Distance between the centers of front and rear wheels',
        'Airbags': 'Number of airbags installed in the vehicle'
      }
      definition = defs[row.label] || null
    }

    // Build comparison summary
    let comparisonSummary = null
    
    // Use backend insight if available
    if (row.insight?.reasonText) {
      comparisonSummary = row.insight.reasonText
    } else if (car1Data?.rating !== null && car2Data?.rating !== null) {
      const diff = Math.abs(car1Data.rating - car2Data.rating)
      if (diff < 0.5) {
        comparisonSummary = `Both vehicles offer comparable ${row.label.toLowerCase()} specifications.`
      } else if (car1Data.rating > car2Data.rating) {
        comparisonSummary = `${car1Name} offers better ${row.label.toLowerCase()} performance in this comparison.`
      } else {
        comparisonSummary = `${car2Name} offers better ${row.label.toLowerCase()} performance in this comparison.`
      }
    } else if (car1Data?.rating !== null || car2Data?.rating !== null) {
      const hasData = car1Data?.rating !== null ? car1Name : car2Name
      comparisonSummary = `Only ${hasData} has ${row.label.toLowerCase()} data available.`
    }

    return {
      key: row.key,
      label: row.label,
      icon: row.icon,
      type: row.type,
      definition,
      comparisonSummary,
      car1: {
        name: car1Name,
        value: car1Data?.displayValue || car1Data?.value || 'N/A',
        rating: car1Data?.rating || null,
        explanation: car1Explanation
      },
      car2: {
        name: car2Name,
        value: car2Data?.displayValue || car2Data?.value || 'N/A',
        rating: car2Data?.rating || null,
        explanation: car2Explanation
      }
    }
  })

  // Filter out info rows from explanations (they don't need detailed explanations)
  const validRows = rows.filter(row => row.type !== 'info')

  // Build section introduction
  let introduction = `This section compares the ${section.label.toLowerCase()} specifications of both vehicles.`

  // Build overall section summary
  let overallSummary = null
  if (validRows.length > 0) {
    const ratedRows = validRows.filter(row => row.car1.rating !== null || row.car2.rating !== null)
    if (ratedRows.length > 0) {
      const car1Wins = ratedRows.filter(row => 
        row.car1.rating !== null && row.car2.rating !== null && 
        row.car1.rating > row.car2.rating
      ).length
      const car2Wins = ratedRows.filter(row => 
        row.car1.rating !== null && row.car2.rating !== null && 
        row.car2.rating > row.car1.rating
      ).length
      const ties = ratedRows.filter(row => 
        row.car1.rating !== null && row.car2.rating !== null && 
        row.car1.rating === row.car2.rating
      ).length

      const car1Name = cars[0]?.car?.brand + ' ' + cars[0]?.car?.model || 'Car 1'
      const car2Name = cars[1]?.car?.brand + ' ' + cars[1]?.car?.model || 'Car 2'

      if (car1Wins > car2Wins && car1Wins > ties) {
        overallSummary = `${car1Name} leads in ${car1Wins} of ${ratedRows.length} compared ${section.label.toLowerCase()} specifications, offering stronger overall performance in this category.`
      } else if (car2Wins > car1Wins && car2Wins > ties) {
        overallSummary = `${car2Name} leads in ${car2Wins} of ${ratedRows.length} compared ${section.label.toLowerCase()} specifications, offering stronger overall performance in this category.`
      } else if (ties >= car1Wins && ties >= car2Wins) {
        overallSummary = `Both vehicles are closely matched across ${ratedRows.length} ${section.label.toLowerCase()} specifications.`
      } else {
        overallSummary = `The ${section.label.toLowerCase()} specifications are well-balanced between both vehicles.`
      }
    } else {
      overallSummary = `${section.label} specifications are comparable between both vehicles.`
    }
  }

  return {
    key: section.key,
    label: section.label,
    icon: section.icon,
    rows,
    introduction,
    overallSummary
  }
}