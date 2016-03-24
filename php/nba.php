<?php
date_default_timezone_set("UTC");
$t = time();
$Cdate = isset($_GET['date']) ? $_GET['date'] : date("Y-m-d", $t);
print_r(nba($Cdate));

/**
@return  array
e.g:
下标0： 主队
下标1： 客队
"grade"： 战绩
“Ename”: 英文名
"Cname": 中文名
"result"： 0 主队胜 1 客队胜 2 平局
 */
function nba($date) {
	if (!preg_match("!^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31)$!", $date)) {
		echo json_encode(array('error' => '请检查是日期格式！'));exit;
	}

	$href = 'http://g.hupu.com/nba/' . $date;

	if (!empty($output = curl($href))) {
		$regex = "|<span class=\"num\s*\w*\">\s*(\w*)\s*</span>\s*<span>.*/teams/(\w*)\">(.*)</a>|";
		preg_match_all($regex, $output, $matches, PREG_PATTERN_ORDER);
		unset($matches[0]);
		if (count($matches[1]) % 2 != 0 || count($matches[2]) % 2 != 0 || count($matches[3]) % 2 != 0 || count($matches[1]) != count($matches[2]) || count($matches[1]) != count($matches[3])) {
			echo json_encode(array('error' => '数据出错！'));exit;
		}
		$teams = array();
		for ($i = 0; $i < count($matches[1]); $i++) {
			$teams[$i] = array_column($matches, $i);
		}
		for ($i = 0; $i < count($teams); $i++) {
			for ($j = 0; $j < count($teams[$i]); $j++) {
				if ($j == 0) {
					$teams[$i]['grade'] = $teams[$i][$j];
				}

				if ($j == 1) {
					$teams[$i]['Ename'] = $teams[$i][$j];
				}

				if ($j == 2) {
					$teams[$i]['Cname'] = $teams[$i][$j];
				}

				unset($teams[$i][$j]);
			}
		}
		$game_list = array();
		for ($i = 0; $i < count($teams); $i += 2) {
			if ($teams[$i]['grade'] > $teams[$i + 1]['grade']) {
				$game_list[] = array($teams[$i], $teams[$i + 1], 'result' => 0);
			}
			if ($teams[$i]['grade'] < $teams[$i + 1]['grade']) {
				$game_list[] = array($teams[$i], $teams[$i + 1], 'result' => 1);
			}
			if ($teams[$i]['grade'] == $teams[$i + 1]['grade']) {
				$game_list[] = array($teams[$i], $teams[$i + 1], 'result' => 2);
			}
		}
		return json_encode($game_list, JSON_UNESCAPED_UNICODE);
	}
}

/**
 * curl函数，传入url
 */
function curl($href) {
	try {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $href);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$output = curl_exec($ch);
		curl_close($ch);
		return $output;
	} catch (Exception $e) {
		echo json_encode(array('error' => 'curl函数报错info:' . $e));exit;
	}
}
