# Msg91 SendOtp Client

**Sample Usage:**

```js
const client = new Msg91Client(
	'api-key-here',
	'template-id-here',
	30*60_000,  // time in milliseconds
	'android-apk-key-hash'
);

client.sendOtpSms('mobile-number-with-cc', '4-digit-otp')
	.then(msg => console.log(msg))
	.catch(err => console.error(err));

client.retryOtpSms('mobile-number-with-cc', 'text')
	.then(msg => console.log(msg))
	.catch(err => console.error(err));

client.verifyOtp('mobile-number-with-cc', '4-digit-otp')
	.then(msg => console.log(msg))
	.catch(err => console.error(err));
```
