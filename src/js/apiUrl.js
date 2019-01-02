var baseUrl = '/'
/* @if HOST_ENV='prod' **
baseUrl = 'https://api.shenzhoubb.com/'
/* @endif */
/* @if HOST_ENV='test' **
baseUrl = 'http://stage.shenzhoubb.com:8080/'
/* @endif */
console.log(baseUrl)