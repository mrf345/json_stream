# json_stream (Beta)
### [jQuery][1cad23e5] based script to monitor and fetch JSON feed upon change.

  [1cad23e5]: https://jquery.com "jQuery website"

## Features :
- Apply jQuery UI effects whenever elements change.
- Execute inserted function whenever elements change.

## [Live Demo][c3246bd6]

  [c3246bd6]: https://audio-sequence.github.io/json_stream.html "Live demo"
#### - Credit: In this example, i am using [Fixer][2a766f21] API to get the latest exchange rates

  [2a766f21]: http://fixer.io "Fixer API website"

![Demo GIF](https://audio-sequence.github.io/json_stream.gif)


## Setup example:
#### - With NPM:
```bash
npm install --save @mrf3/json_stream
```
```javascript
import JsonStream from 'json_stream'
window.addEventListener('load', () => {
  const stream = JsonStream({
    // ... options
    url: 'http://127.0.0.1:5000/',
    data_attr: 'stream',
    use_effect: 'true',
    effect: 'fade'
    // ...
  })  
}
```

### - With browser:
```html
<head>
  <script type="text/javascript"
    src="https://rawgit.com/mrf345/json_stream/master/bin/bundle.js">
  </script>
  <script type="text/javascript">
  window.addEventListener('load', () => {
    JsonStream({
      // ... options
      url: 'http://127.0.0.1:5000/',
      data_attr: 'stream',
      use_effect: 'true',
      effect: 'fade'
      // ... options
    })
  })
  </script>
</head>
```


#### - The body
- Assuming that we will receive a JSON object of the following properties :

```javascript
{
  first: 'The first one',
  second: {
    name: 'some name',
    details: {
      address: 'some address',
      tel: 'telephone'
    }
  }
}
```
```html
<body>
  <h1 stream='first' class='effectit'>
    First to be changed
  </h1>
  <h1 stream='second>details>address' class='effectit'>
    To be changed too
  </h1>
</body>
```

## Options :

```javascript
options = {
  url: options.url || '/', // url to get the json feed
  request_type: options.request_type || 'GET', // http request method to use in ajax
  duration: options.duration * 1000 || 2000, // duration of sleep between each response check
  data_attr: options.data_attr || 'jsonstream', // attaribute assigned to html elements with json property name
  use_watch: options.use_watch || 'true', // to activate watch elements change and update
  watch_class: options.watch_class || '.watchit', // class assigned to elements wanted to be watched
  use_effect: options.use_effect || 'false', // to activate watch elements change with updates and jquery UI effects
  effect: options.effect || exFunctions.choice(exFunctions.effects), // motion effect to use upon data update. Default is randomly chosen
  effect_repeats: options.effect_repeats || 1, // number of times repeating the motion effect
  effect_duration: options.effect_duraton || 1000, // the duration of motion effect
  effect_class: options.effect_class || '.effectit', // class assigned to elements wanted to be watched with motion effects
  use_do: options.use_do || 'false', // to activiate watch elments and update with applying specific function on each update
  todo: options.todo || function (data) {
    if (data) { // data is the json response passed to the function by default
      alert('Got fetched !')
      console.log(data)
    }
  }, // function to be applied on update
  do_class: options.do_class || '.doit' // class assigned to elements wanted to be watched with specific function
}
```

## Useful functions :
#### To use any of the following functions, you have to get an instance of the module, which we did in the Setup section :
` const stream = JsonStream()` </br>
` stream.following_functions()`

#### - Log and status :

```javascript
this.list = function list () {
  // returning a log of the parsed and stored elements
}

this.loops = function loops (log) {
  // returning the status of stored intervals
}

```
#### - Exit and cleanup :

```javascript
this.exit = function exit () {
  // stop and clean up
}
```

## List of jQuery UI effects :

```javascript
const effects = [
  // jquery ui effects
  'blind', 'bounce', 'clip',
  'drop', 'explode', 'fade',
  'fold', 'highlight', 'puff',
  'pulsate', 'scale', 'shake',
  'size', 'slide']
```

## Dependencies:
1. jQuery
2. jQuery UI (optional)
