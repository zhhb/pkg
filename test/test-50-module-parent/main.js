#!/usr/bin/env node

"use strict";

var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var input = "./test-x-index.js";
var output = "./run-time/test-output.exe";

var left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync(
  "node", [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

// case-insensitive for windows
left = left.toLowerCase();
right = right.toLowerCase();

left = left.split("\n");
right = right.split("\n");

assert.equal(left.length, right.length);

left.some(function(leftValue, index) {
  var rightValue = right[index];
  if (leftValue.slice(1, 3) === ":\\") {
    assert.equal(rightValue.slice(1, 3), ":\\");
    leftValue = leftValue.slice(0, 3) + "thebox\\" + leftValue.slice(3);
    assert.equal(leftValue, rightValue);
  } else
  if (leftValue.slice(0, 1) === "/") {
    assert.equal(rightValue.slice(0, 1), "/");
    leftValue = "/thebox" + leftValue;
    assert.equal(leftValue, rightValue);
  } else {
    assert.equal(leftValue, rightValue);
  }
});

utils.vacuum.sync(path.dirname(output));