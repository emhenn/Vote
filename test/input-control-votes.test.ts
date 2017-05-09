import * as Avoriaz from 'avoriaz';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai'
import Vue from 'vue';
import Vuex from 'vuex';
import 'babel-polyfill';

// https://eddyerburgh.gitbooks.io/avoriaz/content/guides/using-with-vuex.html

chai.use(sinonChai);
Avoriaz.use(Vuex);

const Ballots = require('!vue-loader!./../app/views/input-control-votes.vue');

const expect = chai.expect;
const mount = Avoriaz.mount;

describe('Ballot Input', () => {

	const wrapper = mount(Ballots);

	beforeEach(() => {
	});

	it('has the right name', () => {
		expect(wrapper.name()).to.equal('InputControlVotes');
	});
	it('has a description', () => {
		expect(wrapper.text()).to.contain('Votes:');
	});
	it('has style', () => {
		const textarea = wrapper.find('#votes')[0]; // target the styled element
		expect(textarea.hasStyle('white-space', 'pre')).to.be.true;
		expect(textarea.hasStyle('overflow-wrap', 'normal')).to.be.true;
		expect(textarea.hasStyle('overflow-y', 'scroll')).to.be.true;
	});

	describe('Ballots',() => {
		let changeWrapper;

		const eventHub = new Vue();

		const mutations = {
			newBallots: sinon.stub(),
			newCandidates: sinon.stub()
		};

		before(() => {

			Vue.mixin({
				data: () => {
					return {eventHub}
				}
			});

			const actions = {
				changeVotes: sinon.stub(),
			};

			const store = new Vuex.Store({
				actions,
				mutations,
				state: {
					data: {
						delimiter: 'auto'
					},
				}
			});

			changeWrapper = mount(Ballots, {
				store,
				attachToDocument: true
			});
		});

		it('is a Vue component', () => {
			expect(changeWrapper.isVueComponent).to.be.true;
		});
		it('is starts out empty', () => {
			expect(changeWrapper.data().rawInput).to.equal('');
		});
		it('has the right id', () => {
			expect(changeWrapper.contains('#votes')).to.be.true;
		});
		it('contains a textarea', () => {
			expect(changeWrapper.contains('textarea')).to.be.true;
		});
		it('triggers newBallots when the input is changed', () => {
			const count = mutations.newBallots.callCount;

			changeWrapper.setData({rawInput: 'fred'});
			changeWrapper.find('textarea')[0].simulate('change');
			expect(changeWrapper.data().rawInput).to.equal('fred');

			expect(mutations.newBallots).to.have.callCount(count + 1);
		});
		it('triggers newBallots when called from outside', () => {
			const count = mutations.newBallots.callCount;
			eventHub.$emit('getNewBallots');
			expect(mutations.newBallots).to.have.callCount(count + 1);
		});
	});
});