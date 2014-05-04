<?php

$dir = __DIR__;

//pulling
`git pull`;
exec("pkill node");
exec("nohup node {$dir}/server.js > /dev/null &");
