// ==UserScript==
// @name         Basic Question Labelling Party
// @namespace    http://stackoverflow.com/
// @version      0.1
// @description  Hides everything but the 
// @author       Dean Ward
// @match        http://stackoverflow.com/questions/*
// @grant        none
// ==/UserScript==

$(".vote").hide();
$("#answers").hide();
$("#sidebar").hide();
$(".comment").hide();
$(".fw").hide();
