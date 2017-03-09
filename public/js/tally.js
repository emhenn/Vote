/* jshint esversion:6 */
/* global d3 */

/* Notes

[x] disqualifier
[x] make rounds interactive if needed like for handling ties
[x] add vote value first column checkbox
[x] autodetect as default option for comma or tab

sanity checks
[]	do dupe votes
[]	warn on skipped vote
[x]	report number of votes
[x]	report number of candidates (as disqualify)

show all paths?

[x] percentages?

graph progression? area chart. Do this by storing each round? d3?

 */

let votes,
	voteField = document.getElementById('votes'),
	sanity = document.getElementById('sanity'),
	delimiterDropdown = document.getElementById('delimiter'),
	delimiter,
	positions,
	voteValues = document.getElementById('voteValue'),
	disqualifyList = document.getElementById('disqualifyList'),
	results = document.getElementById('results'),
	runButton = document.getElementById('run'),
	current = [],
	candidates = [],
	round = 0,
	eliminations = [],
	history = {};

function nonEmpty(value) {
	return value !== '';
}

function fillCurrent() {
	var index,
		ind,
		res = [],
		lines,
		ballots;

	if (delimiter === 't') {
		delimiter = '\t';
	}

	sanity.innerHTML = '';


	res.push('<p>Sanity Check</p>');


	current = votes.split('\n');
	lines = current.length;
	current = current.filter(nonEmpty);
	ballots = current.length;

	if (lines - ballots > 1) {
		res.push('<p><strong>The number of lines and ballots were different: ' + lines + ':' + ballots + '</strong></p>');
	} else {
		res.push('<p>' + ballots + ' ballots</p>');
	}

	for (index = 0; index < current.length; index++) {
		current[index] = current[index].split(delimiter).filter(nonEmpty);
		for (ind = 0; ind < current[index].length; ind++) {
			current[index][ind] = current[index][ind].trim();
		}
	}

	sanity.innerHTML = res.join('');
}

function pickDelimiter() {
	var tabs = 0,
		commas = 0;

	votes = voteField.value;
	tabs = (votes.match(/\t/g) || []).length;
	commas = (votes.match(/,/g) || []).length;

	if (tabs > 0 && commas === 0) {
		delimiterDropdown.value = 't';
		delimiter = 't';
	}
	if (commas > 0 && tabs === 0) {
		delimiterDropdown.value = ',';
		delimiter = ',';
	}
}

function pickVoteValues() {
	voteValues.checked = !isNaN(Number.parseInt(voteField.value.substring(0, 1), 10));
}

function listDisqualify() {
	var res = [],
		index;

	disqualifyList.innerHTML = '';
	res.push('<p>Disqualify:</p><ul>');

	for (index = 0; index < candidates.length; index++) {
		res.push('<li><label><input type="checkbox" value="' + candidates[index] + '">');
		res.push(candidates[index] + '</label></li>');
	}

	res.push('</ul>');

	disqualifyList.innerHTML = res.join('');
}

function removeDisqualified() {
	var list = disqualifyList.getElementsByTagName('input'),
		index;

	for (index = 0; index < list.length; index++) {
		if (list[index].checked) {
			eliminate(list[index].value);
		}
	}
}

function newVotes() {
	pickDelimiter();
	pickVoteValues();
	fillCurrent();
	countCandidates();
	listDisqualify();
}

function countCandidates() {
	var index,
		ind,
		firstColumn = 0;

	candidates = [];

	if (voteValues.checked) {
		firstColumn = 1;
	} else {
		firstColumn = 0;
	}

	for (index = 0; index < current.length; index++) {
		for (ind = firstColumn; ind < current[index].length; ind++) {
			if (candidates.indexOf(current[index][ind]) === -1) {
				candidates.push(current[index][ind]);
			}
		}
	}
}

function isNot(value) {
	return value !== this.toString();
}


function countXPlace(candidate, place, firstValue) {
	var value = 0,
		index;

	for (index = 0; index < current.length; index++) {
		if (current[index][place] === candidate) {
			if (firstValue) {
				value = value + parseFloat(current[index][0], 10);
			} else {
				value++;
			}
		}
	}

	return value;
}

function eliminate(candidate) {
	var index,
		transfers = {},
		position,
		length,
		value;

	for (index = 0; index < current.length; index++) {
		position = current[index].indexOf(candidate);
		length = current[index].length;

		if (position === 1 && length > position) {
			if (voteValues.checked) {
				value = parseFloat(current[index][0], 10);
			} else {
				value = 1;
			}

			transfers[current[index][position + 1] || 'none'] = transfers[current[index][position + 1]] + value || value;
		}
		current[index] = current[index].filter(isNot, candidate);
	}
	eliminations.push({c: candidate, transfers: transfers});
}

function add(a, b) {
	return a + b;
}

function chart() {
	var formatNumber = d3.format(',.1f'),
		format = function(d) {
			return formatNumber(d) + ' votes';
		},
		color = d3.scaleOrdinal(d3.schemeCategory20),
		svg = d3.select('svg'),
		margin = {top: 20, right: 20, bottom: 20, left: 20},
		width = svg.attr('width') - margin.left - margin.right,
		height = svg.attr('height') - margin.top - margin.bottom,
		sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(10)
			.size([width, height]),
		path = sankey.link(),
		g = svg.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	sankey
		.nodes(history.nodes)
		.links(history.links)
		.layout(32);

	var link = g.append('g').selectAll('.link')
		.data(history.links)
		.enter().append('path')
		.attr('class', 'link')
		.attr('d', path)
		.style('stroke-width', function(d) {
			return Math.max(1, d.dy);
		})
		.sort(function(a, b) {
			return b.dy - a.dy;
		});

	link.append('title')
		.text(function(d) {
			return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);
		});

	var node = g.append('g')
		.selectAll('.node')
		.data(history.nodes)
		.enter().append('g')
		.attr('class', 'node')
		.attr('transform', function(d) {
			return 'translate(' + d.x + ',' + d.y + ')';
		});

	node.append('rect')
		.attr('height', function(d) {
			return d.dy;
		})
		.attr('width', sankey.nodeWidth())
		.style('fill', function(d) {
			return d.color = color(d.name.replace(/ .*/, ''));
		})
		.style('stroke', function(d) {
			return d3.rgb(d.color).darker(2);
		})
		.append('title')
		.text(function(d, i) {
			return d.name + '\n' + format(d.value) + '\n' + i;
		});

	//filter these to not show iv value is zero
	node.append('text')
		.attr('x', -6)
		.attr('y', function(d) {
			return d.dy / 2;
		})
		.attr('dy', '.35em')
		.attr('text-anchor', 'end')
		.attr('transform', null)
		.text(function(d) {
			return d.name;
		})
		.filter(function(d) {
			return d.x < width / 2;
		})
		.attr('x', 6 + sankey.nodeWidth())
		.attr('text-anchor', 'start');

}

function findNode(candidate, round) {
	var result = 0,
		index;

	for (index = 0; index < history.nodes.length; index++) {
		if (history.nodes[index].candidate == candidate && history.nodes[index].round === round) {
			result = index;
		}
	}

	return result;
}

function runRound() {
	var res = [],
		index,
		ind,
		count,
		tally = [],
		total = [],
		grandTotal,
		lowtotal = 'unset',
		lowindex = [],
		lowcount = 0,
		shift = 0,
		mode = 'auto',
		notEliminated,
		waitForInput = false;

	countCandidates();

	if (voteValues.checked) {
		shift = 1;
	} else {
		shift = 0;
	}

	// tally votes

	res.push('<h2>Round ' + round + '</h2>');

	res.push('<p>Candidates in this round are: ');
	for (index = 0; index < candidates.length; index++) {
		res.push(candidates[index]);
		if (index !== candidates.length - 1) {
			res.push(', ');
		}
	}
	res.push('</p>');

	res.push('<table><thead><th>Candidate</th>');
	for (index = 1; index <= positions; index++) {
		res.push('<th>' + index + '</th>');
	}
	res.push('<th>total</th><th>%</th></thead><tbody>');

	// loop through and get values
	for (index = 0; index < candidates.length; index++) {
		tally[index] = [];
		total[index] = 0;
		for (ind = 0 + shift; ind < positions + shift; ind++) {
			count = countXPlace(candidates[index], ind, voteValues.checked);
			tally[index].push(count);
			total[index] += count;
		}

		if (lowtotal === 'unset' || total[index] < lowtotal) { // this is poorly written
			lowtotal = total[index];
		}
	}

	grandTotal = total.reduce(add, 0);

	// build the table
	for (index = 0; index < candidates.length; index++) {
		res.push('<tr><td>' + candidates[index] + '</td>');
		for (ind = 0 + shift; ind < positions + shift; ind++) {
			res.push('<td>' + tally[index][ind - shift] + '</td>');
		}

		res.push('<td>');

		if (total[index] === lowtotal) {
			lowindex.push(index);
			lowcount++;
			res.push('<b>');
		}
		res.push(total[index]);
		if (total[index] === lowtotal) {
			res.push('</b>');
		}
		res.push('</td><td>' + (total[index] * 100 / grandTotal).toFixed(2) + '</td></tr>');
	}
	res.push('</tbody></table>');

	// check what mode we should be in

	if (candidates.length > positions) {
		if (lowcount === 1) {
			res.push('<p>Eliminating ' + candidates[lowindex[0]]);
			eliminate(candidates[lowindex[0]]);
		} else {
			res.push('<p>Tie detected, Pick whom to eliminate:</p>');
			res.push('<button onclick="');
			for (index = 0; index < lowcount; index++) {
				res.push('eliminate(\'' + candidates[lowindex[index]] + '\');');
			}
			res.push('runRound();" type="button">all</button> ');
			for (index = 0; index < lowcount; index++) {
				res.push('<button onclick="eliminate(\'' + candidates[lowindex[index]] + '\');runRound();" type="button">' + candidates[lowindex[index]] + '</button> ');
			}
			mode = 'manual';
			waitForInput = true;
		}
	} else {
		mode = 'done';
	}

	if (round > 15) {
		mode = 'done';
	}

	if (!waitForInput) {
		// add base nodes and self links
		for (index = 0; index < candidates.length; index++) {

			history.nodes.push({
				'name': candidates[index] + ' round ' + round,
				'candidate': candidates[index],
				'round': round
			});

			notEliminated = true;

			for (ind = 0; ind < eliminations.length; ind++) {
				if (candidates[index] === eliminations[ind].c) {
					notEliminated = false;
				}
			}

			if (notEliminated && candidates.length > positions) {
				history.links.push({
					'source': {'c': candidates[index], 'r': round},
					'target': {'c': candidates[index], 'r': round + 1},
					'value': total[index]
				});
			}

			// console.log('linking', candidates[index], history.links[history.links.length - 1].source, history.links[history.links.length - 1].target);

		}

		console.log(round);
		console.dir(eliminations);

		for (index = 0; index < eliminations.length; index++) {
			// console.log('resolving', eliminations[index].c);

			Object.keys(eliminations[index].transfers).forEach(function (transfer) {
				if (transfer !== 'none') {

					history.links.push({
						'source': {'c': eliminations[index].c, 'r': round},
						'target': {'c': transfer, 'r': round + 1},
						'value': eliminations[index].transfers[transfer]
					});

				}
			});
		}

		eliminations = [];

		round++;

	}

	// console.log('end of round', round);


	results.innerHTML += res.join('');
	countCandidates();

	if (mode === 'auto') {
		runRound();
	}

	if (mode === 'done') {
		console.log('--------------');
		console.dir(history);

		for (index = 0; index < history.nodes.length; index++) {
			console.log('node', index, history.nodes[index]);
		}
		console.log('--------------');

		for (index = 0; index < history.links.length; index++) {
			console.log('link', index, history.links[index].source, history.links[index].target, history.links[index].value);
			history.links[index].source = findNode(history.links[index].source.c, history.links[index].source.r);
			history.links[index].target = findNode(history.links[index].target.c, history.links[index].target.r);
			console.log('link', index, history.links[index].source, history.links[index].target, history.links[index].value);
			console.log('link', index, history.nodes[history.links[index].source].name, history.nodes[history.links[index].target].name, history.links[index].value);
			console.log('---');
		}

		// resolve links?

		chart();
	}
} // end runRound

function runReport() {
	votes = voteField.value;
	delimiter = delimiterDropdown.value;
	positions = parseInt(document.getElementById('positions').value, 10);
	results.innerHTML='';
	round = 1;
	fillCurrent();
	removeDisqualified();
	countCandidates();
	history.nodes = [];
	history.links = [];
	eliminations = [];
	runRound();
}

// attach events
if (runButton.addEventListener) {
	runButton.addEventListener('click', runReport, false);
} else if (runButton.attachEvent) {
	runButton.attachEvent('onclick', runReport);
}

if (voteField.addEventListener) {
	voteField.addEventListener('change', newVotes, false);
} else if (voteField.attachEvent) {
	voteField.attachEvent('onchange', newVotes);
}

if (voteValues.addEventListener) {
	voteValues.addEventListener('change', newVotes, false);
} else if (voteValues.attachEvent) {
	voteValues.attachEvent('onchange', newVotes);
}
