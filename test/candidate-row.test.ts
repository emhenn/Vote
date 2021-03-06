import Vue from 'vue';
import Vuex from 'vuex';
import {mount, MountOptions} from '@vue/test-utils';
import {expect} from 'chai';
import 'babel-polyfill';

import Store from '../app/modules/store';

// require('jsdom-global')();

Vue.use(Vuex);

const CandidateRow = require('../app/views/results/candidate-row.vue');

describe('Candidate Row', () => {
	let props = {
		candidate: {
			n: 'a',
			v: [3, 0],
			l: false
		},
		round: 1,
		total: 10
	};

	const store = Store;

	store.state.positions = 2;

	const wrapper = mount(CandidateRow, {store});
	wrapper.setProps(props);

	it('has the right name', () => {
		expect(wrapper.name()).to.equal('candidateRow');
	});
	it('has the right props', () => {
		// expect(wrapper.propsData().candidate.n).to.equal('a');
		expect(wrapper.vm.$props.candidate.n).to.equal('a');
		// expect(wrapper.propsData().candidate.v).to.eql([3, 0]);
		expect(wrapper.vm.$props.candidate.v).to.eql([3, 0]);
		// expect(wrapper.propsData().candidate.l).to.be.false;
		expect(wrapper.vm.$props.candidate.l).to.be.false;
		// expect(wrapper.propsData().round).to.equal(1);
		expect(wrapper.vm.$props.round).to.equal(1);
		// expect(wrapper.propsData().total).to.equal(10);
		expect(wrapper.vm.$props.total).to.equal(10);
	});
	describe('computed', () => {
		it('candidateTotal', () => {
			expect(wrapper.vm['candidateTotal']).to.equal(3);
		});
		it('candidatePercent', () => {
			expect(wrapper.vm['candidatePercent']).to.equal('30.00%');
		});
		it('lowVotes', () => {
			expect(wrapper.vm['lowVotes']).to.be.false;
		});
		it('positions', () => {
			expect(wrapper.vm['positions']).to.equal(2);
		});
	});
	it('renders the correct output', () => {
		expect(wrapper.isVueInstance()).to.be.true;

		const cells = wrapper.findAll('td');

		expect(cells.at(0).html()).to.equal('<td>a</td>');
		expect(cells.at(1).html()).to.equal('<td>3</td>');
		expect(cells.at(2).html()).to.equal('<td>0</td>');
		expect(cells.at(3).html()).to.equal('<td>3</td>');
		expect(cells.at(4).html()).to.equal('<td>30.00%</td>');

		wrapper.update();

		expect(wrapper.findAll('tr').length).to.be.greaterThan(0);
	});
});
