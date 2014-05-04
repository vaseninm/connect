<?php

$dir = __DIR__;

`git pull`;
`pkill node {$dir}/server.js`;
`node {$dir}/server.js`;
