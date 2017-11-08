import * as Avoriaz from 'vue-test-utils';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai'
import Vue from 'vue';
import Vuex from 'vuex';
import 'babel-polyfill';

Vue.use(Vuex);
chai.use(sinonChai);

const Positions = require('../app/views/inputs/positions.vue');

const expect = chai.expect;
const mount = Avoriaz.mount;

describe('Positions', () => {

	const state = require('../app/modules/state');

	const mutations = {
		updatePositions: sinon.stub(),
	};

	const store = new Vuex.Store({
		mutations,
		state
	});

	const wrapper = mount(Positions, {
		store,
		attachToDocument: true
	});

	it('has the right name', () => {
		expect(wrapper.name()).to.equal('inputControlPositions');
	});
	it('notifies the store when changed', () => {
		expect(wrapper.vm['positions']).to.equal(1);
		wrapper.setData({positions: 2});
		wrapper.find('#positions').trigger('change');
		expect(wrapper.vm['positions']).to.equal(2);
	});
});
