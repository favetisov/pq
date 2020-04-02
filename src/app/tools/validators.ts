import * as moment from 'moment';

export const notEmptyValidator = async (value) => {
  return value === null || value === undefined || value === '' ? 'VALIDATORS.field_cannot_be_empty' : '';
};

export const positiveNumberValidator = async (value) => {
  if (!value) return '';
  return parseInt(value) > 0 ? '' : 'VALIDATORS.should_be_positive_number';
};

export const zeroOrMoreValidator = async (value) => {
  if (!value) return '';
  return parseInt(value) >= 0 ? '' : 'VALIDATORS.should_be_positive_number';
};

export const dateValidator = async (value) => {
  if (!value) return '';
  const date = moment(value, 'DD.MM.YYYY');
  if (date.isValid()) return '';
  return 'VALIDATORS.invalid_date_format';
};

export const timeValidator = async (value) => {
  if (!value) return '';
  const [hours, minutes] = value.split(':');
  if (parseInt(hours) < 0 || parseInt(hours) > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59)
    return 'VALIDATORS.invalid_time_format';
};

export const vkValidator = async (value) => {
  if (!value) return '';
  const vkRegExp = new RegExp('^(https://)?vk.com/[a-zA-Z0-9_]{3,}$');
  if (vkRegExp.test(value)) return '';
  return 'VALIDATORS.invalid_vk_format';
};

export const igValidator = async (value) => {
  if (!value) return '';
  const igRegExp = new RegExp('^(https://)?(www.)?instagram.com/[a-zA-Z0-9_]{3,}$');
  if (igRegExp.test(value)) return '';
  return 'VALIDATORS.invalid_ig_format';
};

export const emailValidator = async (value) => {
  if (!value) return '';
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!value.match(emailRegex)) return 'VALIDATORS.incorrect_email_format';
};

export const phoneValidator = async (value) => {
  if (!value) return '';
  if (value.charAt(0) !== '+') return 'VALIDATORS.phone_should_start_plus';
  const phone = '+' + value.replace(new RegExp('[^0-9]', 'g'), '');
  if (phone.length < 9 || phone.length > 16) {
    return 'VALIDATORS.incorrect_phone_format';
  }
};

export const youtubeValidator = async (value) => {
  if (!value) return '';
  const youtubeRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  if (!value.match(youtubeRegex)) return 'VALIDATORS.incorrect_youtube_address';
};

export const webLinkValidator = async (value) => {
  if (!value) return '';
  const regExp = new RegExp('https?:\\/\\/.*');
  console.log(value.toLowerCase());
  if (!value.toLowerCase().match(regExp)) return 'VALIDATORS.should_be_web_link';
};
