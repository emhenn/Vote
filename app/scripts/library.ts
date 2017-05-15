export function nonEmpty(value: string): boolean {
	return value !== '';
}

function isNot(value) {
	return value !== this.toString();
}

export function sortCandidateList(candidates, order) {
	let result = [];

	if (order === 'u') {
		result = candidates;
	} else if (order === 'f') {
		result = candidates.sort();
	} else if (order === 'l') {
		result = candidates.sort((a, b) => {
			const lastA = a.toLowerCase().split(' ').reverse();
			const lastB = b.toLowerCase().split(' ').reverse();
			let	flag = 0;

			if (lastA < lastB) {
				flag = -1;
			} else if (lastA > lastB) {
				flag = 1;
			}

			return flag;
		});
	}
	return result;
}

export function eliminate(state, candidate) {
	console.log('eliminate', candidate);
	const eliminations = [];

	// normalize to candidate allowing function to handle
	// a single elimination via string
	// or multiple eliminations via array
	if (typeof candidate === 'string') {
		candidate = [candidate];
	}

	for (const can of candidate) {
		eliminations.push({c: can, transfers: {}});
	}

	for (let index = 0; index < state.current.length; index++) {
		for (const can of candidate) {
			state.current[index] = state.current[index].filter(isNot, can);
		}
	}

	// state.eventHub.$emit('eliminated', eliminations);
}

export function disqualify(state, candidate) {
	console.log('disqualify', candidate);
	eliminate(state, candidate);
}

export function updateCandidateList(state) {
	state.candidateList = [];
	for (const row of state.current) {
		for (let index = (state.voteValues) ? 1 : 0; index < row.length; index++) {
			if (state.candidateList.indexOf(row[index]) === -1) {
				state.candidateList.push(row[index]);
			}
		}
	}
	sortCandidateList(state.candidateList, state.sortOrder);
}

function countXPlace(state, candidate, place) {
	console.log('counting', candidate, place);

	function countFactory(voteValues) {
		switch (voteValues) {
			case false:
				return (ballot) => 1;
			case true:
				return (ballot) => parseFloat(ballot[0]);
		}
	}

	let value = 0;
	const count = countFactory(state.voteValues);

	// define the return function to return first column or 1
	// and then use that function?

	for (const ballot of state.current) {
		if (ballot[place] === candidate) {
			value = (value + count(ballot));
		}
	}

	return value;
}

export function runRound(state) {
	console.log('running round');
	updateCandidateList(state);

	const round = {candidates: [], roundType: ''};

	for (const candidate of state.candidateList) {
		const tally = [];
		for (let index = 0; index < state.candidateList.length; index++) {
			tally.push(countXPlace( state, candidate, index));
		}
		round.candidates.push({n: candidate, v: tally});
	}
	state.round.push(round);
}
