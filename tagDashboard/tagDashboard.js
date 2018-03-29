import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { LeanCards } from 'meteor/igoandsee:lean-cards-collection';
import { Locations } from 'meteor/igoandsee:locations-collection';
import { TagCategories } from 'meteor/igoandsee:tag-categories-collection';

import moment from 'moment';

import './tagDashboard.html';

Template.tagDashboard.onCreated(function(){
	Session.set('TAG_FILTER', {});
});

Template.tagDashboard.rendered = function(){

	$('.dropdown').dropdown();
	$('.ui.checkbox').checkbox();
	$('.timepickers').datetimepicker();

	$('#filtros-tarjetas').form({
		fields: {
			red: {
				identifier  : 'check',
				rules: [
					{
						type   : 'checkbox',
						prompt : TAPi18n.__('red')
					}
				]
			},
		}
	});

};

Template.tagDashboard.events({

	'change #selectLocation'(e, template) {
		e.preventDefault();
		let value = $('#selectLocation').val()

		let filter = Session.get('TAG_FILTER') || {};
		filter.location = value;
		if (value == 'all') {
			delete filter['location'];
		}
		Session.set('TAG_FILTER', filter);
	},

	'change #selectCategory'(e, template) {
		e.preventDefault();
		let value = $('#selectCategory').val()

		let filter = Session.get('TAG_FILTER') || {};
		filter.category = value;
		if (value == 'all') {
			delete filter['category'];
		}
		Session.set('TAG_FILTER', filter);
	},

	'change #checkRed'(e) {
		let redChecked =  $('#checkRed').is(':checked');
		let yellowChecked =  $('#checkYellow').is(':checked');

		let filter = Session.get('TAG_FILTER') || {};
		if (redChecked && yellowChecked) {
			delete filter['type'];
		} else if (!redChecked && !yellowChecked) {
			filter.type = 'mockFilter';
		} else {
			var type = redChecked?1:2;
			filter.type = type;
		}
		Session.set('TAG_FILTER', filter);
	},

	'change #checkYellow'(e) {
		let redChecked =  $('#checkRed').is(':checked');
		let yellowChecked =  $('#checkYellow').is(':checked');

		let filter = Session.get('TAG_FILTER') || {};
		if (redChecked && yellowChecked) {
			delete filter['type'];
		} else if (!redChecked && !yellowChecked) {
			filter.type = 'mockFilter';
		} else {
			var type = redChecked?1:2;
			filter.type = type;
		}
		Session.set('TAG_FILTER', filter);
	},

	'click .cleardate'(e) {
		let target = $(e.target);
		let input = $(target.closest('.clearlabel')).siblings('input')
		input.val('');
		let type = target.closest('.field').data('type');

		let filter = Session.get('TAG_FILTER') || {};
		switch(type) {
			case 'created-after' :
				delete filter.originDate.$gt;
				break;
			case 'created-before' :
				delete filter.originDate.$lt;
				break;
			case 'expired-after' :
				delete filter.dueDate.$gt;
				break;
			case 'expired-before' :
				delete filter.dueDate.$lt;
				break;
		}

		if (filter.originDate && Object.keys(filter.originDate).length == 0) {
			delete filter.originDate;
		}

		if (filter.dueDate && Object.keys(filter.dueDate).length == 0) {
			delete filter.dueDate;
		}

		Session.set('TAG_FILTER', filter);
	},

	//TODO change to reactive var
	'change .timepickers'(e) {
		let target = $(e.target);
		let dateValue = (new Date(target.val())).getTime();

		let type = target.closest('.field').data('type');

		let filter = Session.get('TAG_FILTER') || {};
		switch(type) {
			case 'created-after' :
				filter.originDate = filter.originDate || {};
				filter.originDate.$gt = dateValue;
				break;
			case 'created-before' :
				filter.originDate = filter.originDate || {};
				filter.originDate.$lt = dateValue;
				break;
			case 'expired-after' :
				filter.dueDate = filter.dueDate || {};
				filter.dueDate.$gt = dateValue;
				break;
			case 'expired-before' :
				filter.dueDate = filter.dueDate || {};
				filter.dueDate.$lt = dateValue;
				break;
		}

		Session.set('TAG_FILTER', filter);
	}

});

Template.tagDashboard.helpers({

	getCurrentLeanCards() {
		let now = Date.now();
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : {$ne:2}, expired: false});
		console.log(query);
		return LeanCards.find(query, {sort: {originDate: -1}});
	},

	getExpiredLeanCards() {
		let now = Date.now();
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : {$ne:2}, expired: true});
		return LeanCards.find(query, {sort: {originDate: 1}});
	},

	getClosedLeanCards() {
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : 2});
		return LeanCards.find(query, {sort: {originDate: -1}});
	},

	showCurrentLeanCards() {
		let now = Date.now();
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : {$ne:2}, expired: false});
		console.log(query);
		return LeanCards.find(query).count() > 0;
	},

	showExpiredLeanCards() {
		let now = Date.now();
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : {$ne:2}, expired: true});
		return LeanCards.find(query).count() > 0;
	},

	showClosedLeanCards() {
		let query = Session.get('TAG_FILTER') || {};
		Object.assign(query, {status : 2});
		return LeanCards.find(query).count() > 0;
	},

	getLocations() {
		return Locations.find();
	},

	getCategories() {
		return TagCategories.find();
	}

});

Template.leanCardItem.events({

	'click .tarjeta'(e) {
		let target = $(e.target).closest('.tarjeta');
		let id = target.data('id');
		Router.go('tagDetail', {idCard:id});
	}

});

Template.leanCardItem.helpers({

	getCardClass(type) {
		return type == 1?'roja':'amarilla';
	},


	getBoldClass(type) {
		return type == 1?'amarillo':'naranja';
	},

	formatDate(date) {
		return moment(date).format('DD MMM YYYY');
	},

	getLocation(locationId) {
		return Locations.findOne(locationId).name;
	},

	getCategory(categoryId) {
		return TagCategories.findOne(categoryId).name;
	},

	getDescription(descriptions) {
		var arrayDescriptions = descriptions.map( (description) => {
			if (description.type == 0) return description.data;
		});

		arrayDescriptions = arrayDescriptions.filter( (description) => !!description );

		if (arrayDescriptions.length > 0) {
				return arrayDescriptions.join(', ');
		}
		return TAPi18n.__('view_detail');
	},

	isUrgent() {
		return false;
	},

	toApprove() {
		return false;
	}

});
