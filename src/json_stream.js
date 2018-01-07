/* global $, alert */ // to avoide linter false alarm

/*

Script : json_stream 0.1 beta
Author : Mohamed Feddad
Date : 2017/12/26
Source : https://github.com/mrf345/json_stream
License: MPL 2.0
Dependencies: Jquery, Jquery UI (optional)
Today's lesson: Not everyday you learn a lesson !

 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 */

const JsonStream = function jsonStream (options) {
  // Pythonic and validation functions
  const checkType = function checkType (type, args) {
    // checking the type of each varible in the passed array
    for (let a in args) {
      if (typeof args[a] !== type) return false
    }
    return true
  }
  const checkBool = function checkBool (args) {
    // check if passed args are 'true' or 'false' type
    for (let a in args) {
      if (args[a] !== 'true' && args[a] !== 'false') return false
    }
    return true
  }
  const choice = function choice (list) {
  // to chose randomly from an Array
    if (!(list instanceof Array)) throw new TypeError('choice() taskes only Arrays')
    if (list.length <= 0) throw new Error('choice() requires pupliated Array')
    let powerOfLength = Math.floor(list.length / 10)
    if (powerOfLength <= 0) powerOfLength = 1
    return list[Math.floor(Math.random() * (10 * powerOfLength))]
  }
  const effects = [
    // jquery UI motion effects
    'blind', 'bounce', 'clip',
    'drop', 'explode', 'fade',
    'fold', 'highlight', 'puff',
    'pulsate', 'scale', 'shake',
    'size', 'slide'
  ]

  // Home of the json stream
  if (!window.jQuery) throw new Error('json_stream() depends on jquery, go get it') // jquery early check
  if (typeof options !== 'object') options = {}
  this.options = {
    url: options.url || '/', // url to get the json feed
    request_type: options.request_type || 'GET', // http request method to use in ajax
    duration: options.duration * 1000 || 2000, // duration of sleep between each response check
    data_attr: options.data_attr || 'jsonstream', // attaribute assigned to html elements with json property name
    use_watch: options.use_watch || 'true', // to activate watch elements change and update
    watch_class: options.watch_class || '.watchit', // class assigned to elements wanted to be watched
    use_effect: options.use_effect || 'false', // to activate watch elements change with updates and jquery UI effects
    effect: options.effect || choice(effects), // motion effect to use upon data update. Default is randomly chosen
    effect_repeats: options.effect_repeats || 1, // number of times repeating the motion effect
    effect_duration: options.effect_duraton || 1000, // the duration of motion effect
    effect_class: options.effect_class || '.effectit', // class assigned to elements wanted to be watched with motion effects
    use_do: options.use_do || 'false', // to activiate watch elments and update with applying specific function on each update
    todo: options.todo || function () { alert('JSON Streams !') }, // function to be applied on update
    do_class: options.do_class || '.doit' // class assigned to elements wanted to be watched with specific function
  }

  this.defaults = {
    watch: [], // where list of parsed elments wiht watch_class are stored
    effect: [], // where list of parsed elements with effect_effect are stored
    doit: [], // where list of parsed elemts with do_clas are sotred
    watch_loop: false, // this.watch_them() loop
    effect_loop: false, // this.effect_them() loop
    do_loop: false // this.do_them() loop
  }

  this.__init__ = function __init__ () {
  // type validation
    // strings
    if (!checkType('string', [
      this.options.request_type,
      this.options.data_attr,
      this.options.url,
      this.options.use_watch,
      this.options.effect,
      this.options.use_do,
      this.options.effect_class,
      this.options.do_class
    ])) throw new TypeError('json_stream(options) requires string')
    // numbers
    if (!checkType('number', [
      this.options.effect_repeats,
      this.options.effect_duration,
      this.options.duration
    ])) throw new TypeError('json_stream(options) repeats and durations require number')
    // functions
    if (!checkType('function', [
      this.options.todo])) throw new TypeError('json_stream(options) todo requires a function')
    // booleans
    if (!checkBool([
      this.options.use_watch,
      this.options.use_effect,
      this.options.use_do])) throw new TypeError('json_stream(options) use require "true" or "false"')

  // value validation
    if (this.options.use_effect === 'true' && !$.ui
      ) throw new Error('json_stream(use_effect) requires jquery UI, go get it')
    $.each([ // making sure number values > 0
      this.options.duration,
      this.options.effect_repeats,
      this.options.effect_duration], function (n, value) {
      if (value < 0) value = 0
    })

  // setup
    $.ajaxSetup({ // setting up request settings once and for all
      success: function (response) { return response },
      contentType: 'application/json',
      type: this.options.request_type,
      url: this.options.url, // if request fails a throw dispatched
      error: function () { throw new Error('json_stream() cannot reach to the server !') }
    })
    window.addEventListener('load', function () {
      this.parse() // pasrsing elements accourding to the classes
      // lunching the loops
      if (this.options.use_watch === 'true') this.watch_them()
      if (this.options.use_effect === 'true') this.effect_them()
      if (this.options.use_do === 'true') this.do_them()
    })
  }

// Intervals and sequenced effects. Bread and Butter

  this.watch_them = function watchThem (watch = this.defaults.watch, dattr = this.options.data_attr) {
    // updating elements with json feed, if it changes and looping it with a duration
    let inter = setInterval(function () {
      $.getJSON(this.options.url,
        function (response) {
          $.each(watch, function (n, elemenT) { // looping through parsed elements
            let elemenTName = $(elemenT).attr(dattr)
            if (isProperty(response, elemenTName) && getProperty(response, elemenTName).toString() !== $(elemenT).html()) {
              $(elemenT).html(getProperty(response, elemenTName)) // if it change, set the new feed
            }
          })
        })
    }, this.options.duration) // looping with the inserted duration
    if (this.defaults.watch_loop) clearInterval(this.defaults.watch_loop) // clearing previous loop
    else this.defaults.watch_loop = inter // storring new loop
  }

  this.effect_them = function effectThem (
    // updating elments with jason feed, and applying selected effects with timeout
    // sequance to achieve proper repeating effect
    watch = this.defaults.effect,
    effect = this.options.effect,
    repeats = this.options.effect_repeats,
    eduration = this.options.effect_duration,
    dattr = this.options.data_attr) {
    let inter = setInterval(function () {
      $.getJSON(this.options.url, function (response) {
        $.each(watch, function (n, elemenT) {
          var elemenTName = $(elemenT).attr(dattr)
          if (isProperty(response, elemenTName) && getProperty(response, elemenTName).toString() !== $(elemenT).html()) {
            $(elemenT).html(getProperty(response, elemenTName)) // updating the elemnt if the content changes
            $(elemenT).toggle(effect, {}, eduration)
            const tokill = [] // to store setTimeouts in, to kill them later
            tokill.push(setTimeout(function effe (counter = 0, rdur = eduration) {
              // sequanced time outs with recursion to achieve proper repeating
              if (repeats > 1) var newRepeat = (repeats * 2) - 1; else newRepeat = repeats
              if (newRepeat > counter) { // to stop recursing if limit is met
                $(elemenT).toggle(effect, {}, eduration)
                tokill.push(setTimeout(function () { effe(counter + 1, rdur) }, rdur))
              } else $.each(tokill, function (a, v) { clearTimeout(v) }) // killing timeouts
            }, 0)) // timed out, to avoide a used once function
          }
        })
      })
    }, this.options.duration) // looping with the inserted duration
    if (this.defaults.effect_loop) clearInterval(this.defaults.effect_loop) // clearing previous loop
    else this.defaults.effect_loop = inter // storring new loop
  }

  this.do_them = function doThem (watch = this.defaults.doit,
    // updating elements with json feed and executing inserted function upon change
    todo = this.options.todo, dattr = this.options.data_attr) {
    let inter = setInterval(function () {
      $.getJSON(this.options.url,
        function (response) {
          $.each(watch, function (n, elemenT) {
            let elemenTName = $(elemenT).attr(dattr)
            if (isProperty(response, elemenTName) && getProperty(response, elemenTName).toString() !== $(elemenT).html()) {
              $(elemenT).html(getProperty(response, elemenTName)) // update it
              setTimeout(todo, 0) // execute the inserted function
            }
          })
        })
    }, this.options.duration) // looping with the inserted duration
    if (this.defaults.do_loop) clearInterval(this.defaults.do_loop) // clearing previous loop
    else this.defaults.do_loop = inter // storring new loop
  }

// Dealing with elements

  const isProperty = function splitCheck (response, name) {
    // to check if the json recieved contains a property
    try {
      name = name.split('>')
      if (name.length > 1) return eval('response.' + name.slice(0, -1).join('.') + '.hasOwnProperty("' + name.slice(-1) + '")')
      else return response[name]
    } catch (e) {
      return false
    }
  }

  const getProperty = function equalPropery (response, name) {
    // to get the value of a property
    try {
      name = name.split('>')
      if (name.length > 1) return eval('response.' + name.slice(0, -1).join('.') + '["' + name.slice(-1) + '"]')
      else return response[name]
    } catch (e) {
      return false
    }
  }

  this.parse = function parse () {
    // parsing with elements identifiers and storing them in defaults lists
    const list = []
    let l; for (let opt in l = [
      this.options.watch_class,
      this.options.do_class,
      this.options.effect_class]) { // looping through identifiers
      $(l[opt]).each(function () {
        list.push(this) // storing elements that match identifers
      }) // correct destination
      if (opt === '0') this.defaults.watch = this.defaults.watch.concat(list)
      if (opt === '1') this.defaults.doit = this.defaults.doit.concat(list)
      if (opt === '2') this.defaults.effect = this.defaults.effect.concat(list)
      list.splice(0, list.length)
    }
    list.splice(0, list.length) // clear list
  }

  this.clear_parse = function clearParse () {
    // clean up elements storage in defaults lists
    $.each([
      this.defaults.watch,
      this.defaults.doit,
      this.defaults.effect], function (k, list) {
      list.splice(0, list.length) // clear each
    })
  }

// Dealing with Intervals

  this.clear_loops = function abort () {
    // clear each loop if it is running
    $.each([
      this.defaults.watch_loop,
      this.defaults.effect_loop,
      this.defaults.doit_loop], function (n, value) {
      if (value) clearInterval(value) // if not false, it is running
    })
  }

// Listing and logging

  this.list = function list () {
    // returning a log of the parsed and stored elements
    $.each([
      this.defaults.watch,
      this.defaults.effect,
      this.defaults.doit
    ], function (n, value) {
      let name
      if (n === 0) name = 'Watch it :'; else if (
        n === 1) name = 'Effect it :'; else name = 'Do it :'
      console.log(name)
      console.log(value)
    })
  }

  this.loops = function loops (log) {
    // returning the status of stored intervals
    if (this.defaults.watch_loop) log = true; else log = false
    console.log(this.defaults.watch_loop)
    console.log('Watch is : ' + log)
    if (this.defaults.effect_loop) log = true; else log = false
    console.log('Effect is : ' + log)
    if (this.defaults.doit_loop) log = true; else log = false
    console.log('Do is : ' + log)
  }

// We are done

  this.exit = function exit () {
    // cleaning up
    this.clear_loops()
    this.clear_parse()
  }

// initiating and returning the class

  this.__init__()
  return this
}
