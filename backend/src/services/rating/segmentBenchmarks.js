// backend/src/services/rating/segmentBenchmarks.js
/*
================================================================================
File Name : segmentBenchmarks.js
Description : DEPRECATED SHIM. Benchmark data and resolution logic have been
              split into ./benchmarks/segmentRanges.data.js (pure data),
              ./benchmarks/evOverrides.data.js (pure data), and
              ./benchmarks/benchmarkResolver.js (resolution logic) — see
              those files. This file re-exports the same names purely so any
              existing import of './rating/segmentBenchmarks' keeps working
              without modification. New code should import directly from
              ./benchmarks/benchmarkResolver instead.
================================================================================
*/

const { SEGMENT_RANGES } = require('./benchmarks/segmentRanges.data');
const { EV_OVERRIDE_RANGES } = require('./benchmarks/evOverrides.data');
const { getSegmentRange, getSegmentLabel, hasBenchmark, getIndustryRange } = require('./benchmarks/benchmarkResolver');

module.exports = { SEGMENT_RANGES, EV_OVERRIDE_RANGES, getSegmentRange, getSegmentLabel, hasBenchmark, getIndustryRange };