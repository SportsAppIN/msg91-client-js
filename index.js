'use strict';

const {encode} = require('querystring');
const fetch = require('node-fetch');

class Msg91Client {

	/**
	 * This client assumes that your template has 3 variables namely OTP, EXPIRY (in minutes) and HASH (android apk hash)
	 *
	 * @param {string} apikey
	 * @param {string} otpDltTemplateId
	 * @param {number} otpExpiryInMilliseconds default 5 minutes
	 * @param {string|null} [androidApkHash]
	 */
	constructor(apikey, otpDltTemplateId, otpExpiryInMilliseconds = 5 * 60_000, androidApkHash = null) {
		if(typeof apikey !== 'string') throw new TypeError('apiKey must be string');
		this._apiKey = apikey;

		if(typeof otpDltTemplateId !== 'string') throw new TypeError('otpDltTemplateId must be a string');
		this._otpDltTemplateId = otpDltTemplateId;

		if(typeof otpExpiryInMilliseconds !== 'number') throw new TypeError('otpExpiryInMilliseconds must be a number greater than 60_000');
		this._otpExpiryInMilliseconds = otpExpiryInMilliseconds;

		if(androidApkHash && typeof androidApkHash !== 'string') throw new TypeError('androidApkHash must be a string');
		this._androidApkHash = androidApkHash || null;

		this._apiBaseUrl = 'https://api.msg91.com/api/v5/otp';

	}

	/**
	 *
	 * @param {string} mobileNumberWithCountryCode
	 * @param {string} otp
	 * @return {Promise<string>}
	 */
	async sendOtpSms(mobileNumberWithCountryCode, otp) {

		if(typeof mobileNumberWithCountryCode !== 'string') throw new TypeError('mobileNumber must be a string');

		if(typeof otp !== 'string' || otp.length !== 4) throw new TypeError('otp must be a string of length 4');

		const queryParams = {
			template_id: this._otpDltTemplateId,
			mobile: mobileNumberWithCountryCode,
			authkey: this._apiKey,
			otp: otp,
			otp_expiry: this._otpExpiryInMilliseconds / 60_000,
			extra_param: JSON.stringify(
				{
					OTP: otp,
					EXPIRY: this._otpExpiryInMilliseconds / (60_000),
					HASH: this._androidApkHash,
				}
			)
		};

		let response = await fetch(this._apiBaseUrl + '/?' + encode(queryParams));

		if(response.ok && (response = await response.json())['type'] === 'success')
			return response['message'];
		else {
			console.error(`[msg91-client-js] sendOtpSms: error for mobile= ${mobileNumberWithCountryCode} & otp= ${otp}. response= ${JSON.stringify(response)}`);
			throw new Error('unable to send otp sms');
		}

	}


	/**
	 *
	 * @param {string} mobileNumberWithCountryCode
	 * @param {'text'|'voice'} retryType
	 * @return {Promise<string>}
	 */
	async retryOtpSms(mobileNumberWithCountryCode, retryType) {

		if(typeof mobileNumberWithCountryCode !== 'string') throw new TypeError('mobileNumber must be a string');

		if(retryType !== 'text' && retryType !== 'voice') throw new TypeError('retryType must be one of text or voice');

		const queryParams = {
			authkey: this._apiKey,
			mobile: mobileNumberWithCountryCode,
			retrytype: retryType,
		};

		let response = await fetch(this._apiBaseUrl + '/retry?' + encode(queryParams));

		if(response.ok && (response = await response.json())['type'] === 'success') {
			return response;
		} else {
			console.error(`[msg91-client-js] retryOtpSms: error for mobile= ${mobileNumberWithCountryCode}. response= ${JSON.stringify(response)}`);
			throw new Error('unable to retry otp sms');
		}

	}


	/**
	 *
	 * @param {string} mobileNumberWithCountryCode
	 * @param {string} otp
	 * @return {Promise<string>}
	 */
	async verifyOtp(mobileNumberWithCountryCode, otp) {

		if(typeof mobileNumberWithCountryCode !== 'string') throw new TypeError('mobileNumber must be a string');

		if(typeof otp !== 'string' || otp.length !== 4) throw new TypeError('otp must be a string of length 4');

		const queryParams = {
			mobile: mobileNumberWithCountryCode,
			authkey: this._apiKey,
			otp: otp,
			otp_expiry: this._otpExpiryInMilliseconds / 60_000,
		};

		let response = await fetch(this._apiBaseUrl + '/verify?' + encode(queryParams));

		if(response.ok && (response = await response.json())['type'] === 'success') {
			return response['message'];
		} else {
			console.error(`[msg91-client-js] verifyOTP: error for mobile= ${mobileNumberWithCountryCode} & otp= ${otp}. response= ${JSON.stringify(response)}`);
			throw new Error('unable to verify otp');
		}

	}

}

module.exports = Msg91Client;
