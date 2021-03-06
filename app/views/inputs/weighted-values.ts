export default {
	computed: {
		voteValues: {
			get: function () {
				return this.$store.state.voteValues;
			},
			set: function () {
			}
		}
	},
	methods: {
		changeVoteValues() {
			this.$store.commit('updateVoteValues', (this.$refs.voteValues as HTMLFormElement).checked);
			return this.$store.dispatch('inputChange');
		},
	},
	name: 'inputControlWeightedValues',
};


// import Vue from 'vue';
//
// import Component from 'vue-class-component';
//
// @Component
// export default class inputControlWeightedValues extends Vue {
// 	get voteValues() {
// 		return this.$store.state.voteValues;
// 	}
//
// 	changeVoteValues() { //method
// 		this.$store.commit('updateVoteValues', (this.$refs.voteValues as HTMLFormElement).checked);
// 		this.$store.commit('newCandidates');
// 	}
// }
