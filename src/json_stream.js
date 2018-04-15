import $ from 'jquery'
import 'jquery-ui-bundle'
import exFunctions from './exFunctions.js'

/* global alert */ // to avoide linter false alarm
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export default function JsonStream (options) {
  // Home of the json stream
  if (!$) throw new Error('json_stream() depends on jquery, go get it') // jquery early check
  if (typeof options !== 'object') options = {}
  const returnit = {} // to use instead of this, and return class properties

  returnit.options = {
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
    effect_do_class: options.effect_do_class || '.effectdoit', // class assigned to element wanted to be watched with motion effect and todo function executed
    use_effect_do: options.use_effect_do || 'false', // to activate watch elments change with effects and function execution
    use_do: options.use_do || 'false', // to activiate watch elments and update with applying specific function on each update
    todo: options.todo || function (data) {
      if (data) { // data is the json response passed to the function by default
        alert('Got fetched !')
        console.log(data)
      }
    }, // function to be applied on update
    do_class: options.do_class || '.doit', // class assigned to elements wanted to be watched with specific function
    ensure_class: options.ensure_class || 'ensureit', // class assigned to elements which will be ensured to update with other values
    ensure_value: options.ensure_value || 'id' // value which will be checked in the json response to triger update instead of depending on the default content change
  }

  returnit.defaults = {
    watch: [], // where list of parsed elments wiht watch_class are stored
    effect: [], // where list of parsed elements with effect_effect are stored
    doit: [], // where list of parsed elemts with do_clas are sotred
    effectdo: [], // where list of parsed elements with effect_do are stored
    watch_loop: false, // watchThem() loop
    effect_loop: false, // effectThem() loop
    do_loop: false, // doThem() loop
    effectdo_loop: false, // effectThem(doit=true) loop
    ensure_values: [[], []] // to store ensure new values
  }

  const __init__ = function __init__ () {
  // type validation
    // strings
    if (!exFunctions.checkType('string', [
      returnit.options.request_type,
      returnit.options.data_attr,
      returnit.options.url,
      returnit.options.use_watch,
      returnit.options.effect,
      returnit.options.use_do,
      returnit.options.effect_class,
      returnit.options.do_class,
      returnit.options.use_effect_do,
      returnit.options.effect_do_class
    ])) throw new TypeError('json_stream(options) requires string')
    // numbers
    if (!exFunctions.checkType('number', [
      returnit.options.effect_repeats,
      returnit.options.effect_duration,
      returnit.options.duration
    ])) throw new TypeError('json_stream(options) repeats and durations require number')
    // functions
    if (!exFunctions.checkType('function', [
      returnit.options.todo])) throw new TypeError('json_stream(options) todo requires a function')
    // booleans
    if (!exFunctions.checkBool([
      returnit.options.use_watch,
      returnit.options.use_effect,
      returnit.options.use_effect_do,
      returnit.options.use_do])) throw new TypeError('json_stream(options) use require "true" or "false"')

  // value validation
    if (returnit.options.use_effect === 'true' && !$.ui
  ) throw new Error('json_stream(use_effect) requires jquery UI, go get it')
    $.each([ // making sure number values > 0
      returnit.options.duration,
      returnit.options.effect_repeats,
      returnit.options.effect_duration], function (n, value) {
      if (value < 0) value = 0
    })

  // setup
    $.ajaxSetup({ // setting up request settings once and for all
      success: function (response) { return response },
      contentType: 'application/json',
      type: returnit.options.request_type,
      url: returnit.options.url, // if request fails a throw dispatched
      error: function () { throw new Error('json_stream() cannot reach to the server !') }
    })
    $(document).ready(function () {
      returnit.parse(() => {
        // lunching the loops
        if (returnit.options.use_watch === 'true') watchThem()
        if (returnit.options.use_effect === 'true') effectThem()
        if (returnit.options.use_do === 'true') doThem()
        if (returnit.options.use_effect_do == 'true') effectThem(true)
      }) // pasrsing elements accourding to the classes
    })
  }

// Intervals and sequenced effects. Bread and Butter

  const watchThem = function watchThem () {
    // updating elements with json feed, if it changes and looping it with a duration
    let inter = setInterval(function () {
      $.getJSON(returnit.options.url,
        function (response) {
          returnit.defaults.watch.forEach((elemenT, n) => { // looping through parsed elements
            let result = getProperty(
              response,
              $(elemenT).attr(returnit.options.data_attr)) // obj>obj>.. geting element property
            if (result) if (result.toString() !== $(elemenT).html() || checkEnsure(elemenT, getProperty(response, returnit.options.ensure_value))) {
              // updating ensureval if not matching, otherwise endless loop
              if ($(elemenT).attr('ensureval')) $(elemenT).attr('ensureval', value=getProperty(response, returnit.options.ensure_value))
              $(elemenT).html(result)
            }
          }) // if it change, set the new feed
        })
    }, returnit.options.duration) // looping with the inserted duration
    if (returnit.defaults.watch_loop) clearInterval(returnit.defaults.watch_loop) // clearing previous loop
    else returnit.defaults.watch_loop = inter // storring new loop
  }

  const effectThem = function effectThem (doit=false) {
  // updating elments with jason feed, and applying selected effects with timeout
  // sequance to achieve proper repeating effect

    let inter = setInterval(function () {
      $.getJSON(returnit.options.url, response => {
        let loopin = doit ? returnit.defaults.effectdo : returnit.defaults.effect
        loopin.forEach((elemenT, n) => {
          let result = getProperty(response, $(elemenT).attr(returnit.options.data_attr))
          let ensureVal = getProperty(response, returnit.options.ensure_value)
          let ensureInd = returnit.defaults.ensure_values[0].indexOf(elemenT)
          let ensureQuer = returnit.defaults.ensure_values[1][ensureInd]
          if (result && result.toString() !== $(elemenT).html() || ensureVal !== ensureQuer) {
            // updating ensureval if not matching, otherwise endless loop
            if ($(elemenT).hasClass(returnit.options.ensure_class)) returnit.defaults.ensure_values[1][ensureInd] = ensureVal
            $(elemenT).html(result) // updating the elemnt if the content changes
            if (doit) returnit.options.todo(response) // executing doit function if allowed
            $(elemenT).toggle(returnit.options.effect, {}, returnit.options.effect_duration)
            const tokill = [] // to store setTimeouts in, to kill them later
            tokill.push(setTimeout(function effe (counter = 0) {
              // sequanced time outs with recursion to achieve proper repeating
              let newRepeat = returnit.options.effect_repeats
              if (returnit.options.effect_repeats > 1) newRepeat = (returnit.options.effect_repeats * 2) - 1
              if (newRepeat > counter) { // to stop recursing if limit is met
                $(elemenT).toggle(returnit.options.effect, {}, returnit.options.effect_duration)
                tokill.push(setTimeout(() => effe(counter + 1,
                  returnit.options.effect_duration),
                  returnit.options.effect_duration))
              } else tokill.forEach(v => clearTimeout(v)) // killing timeouts
            }, 0)) // timed out, to avoide a used once function
          }
        })
      })
    }, returnit.options.duration) // looping with the inserted duration
    if (doit) { // if doit is used
      returnit.defaults.effectdo_loop ? clearInterval(returnit.defaults.effectdo_loop) : returnit.defaults.effectdo_loop = inter // clearing or storring new loop
    } else { // if normal effectit
      returnit.defaults.effect_loop ? clearInterval(returnit.defaults.effect_loop) : returnit.defaults.effect_loop = inter // clearing or storring new loop
    }
  }

  const doThem = function doThem () {
    // updating elements with json feed and executing inserted function upon change
    let inter = setInterval(function () {
      $.getJSON(returnit.options.url,
        function (response) {
          returnit.defaults.doit.forEach((elemenT, n) => {
            let result = getProperty(response, $(elemenT).attr(returnit.options.data_attr))
            if (result && result.toString() !== $(elemenT).html() || checkEnsure(elemenT, getProperty(response, returnit.options.ensure_value))) {
              // updating ensureval if not matching, otherwise endless loop
              if ($(elemenT).attr('ensureval')) $(elemenT).attr('ensureval', value=getProperty(response, returnit.options.ensure_value))
              $(elemenT).html(result)
              returnit.options.todo(response)
            }
          })
        })
    }, returnit.options.duration) // looping with the inserted duration
    if (returnit.defaults.do_loop) clearInterval(returnit.defaults.do_loop) // clearing previous loop
    else returnit.defaults.do_loop = inter // storring new loop
  }

// Dealing with elements

  const getProperty = function getProperty (response, name) {
    // to get the value of elements property
    name.split('>').forEach(sname => {
      response.hasOwnProperty(sname) ? response = response[sname] : response = undefined
    })
    return response
  }

  const checkEnsure = function checkEnsure (element, ensures) {
    // to check if element has ensure and if it has changed
    if ($(element).attr('ensureval')) return $(element).attr('ensureval') === ensures ? false : true
    else return false
  }

  returnit.parse = function parse (callback=() => {}) {
    // parsing with elements identifiers and storing them in defaults lists
    const list = []
    const classes = [
      returnit.options.watch_class,
      returnit.options.do_class,
      returnit.options.effect_class,
      returnit.options.effect_do_class
    ]
    classes.forEach((value, index) => {
      $(value).each(function () {
        if ($(this).hasClass(returnit.options.ensure_class)) {
          // adding default ensure value if it's ensured
          returnit.defaults.ensure_values[0].push(this)
          returnit.defaults.ensure_values[1].push('0')
        }
        list.push(this) // storing elements that match identifers
      }) // correct destination
      if (index === 0) returnit.defaults.watch = returnit.defaults.watch.concat(list)
      if (index === 1) returnit.defaults.doit = returnit.defaults.doit.concat(list)
      if (index === 2) returnit.defaults.effect = returnit.defaults.effect.concat(list)
      if (index === 3) returnit.defaults.effectdo = returnit.defaults.effectdo.concat(list)
      list.splice(0, list.length)
    })
    list.splice(0, list.length) // clear list
    callback() // lunch the loops after parsing is done
  }

  const clearParse = function clearParse () {
    // clean up elements storage in defaults lists
    $.each([
      returnit.defaults.watch,
      returnit.defaults.doit,
      returnit.defaults.effect,
      returnit.defaults.effectdo
    ], function (k, list) {
      list.splice(0, list.length) // clear each
    })
  }

// Dealing with Intervals

  const abort = function abort () {
    // clear each loop if it is running
    $.each([
      returnit.defaults.watch_loop,
      returnit.defaults.effect_loop,
      returnit.defaults.doit_loop,
      returnit.defaults.effectdo_loop
    ], function (n, value) {
      if (value) clearInterval(value) // if not false, it is running
    })
  }

// Listing and logging

  returnit.list = function list () {
    // returning a log of the parsed and stored elements
    $.each([
      returnit.defaults.watch,
      returnit.defaults.effect,
      returnit.defaults.doit,
      returnit.defaults.effectdo
    ], function (n, value) {
      let name
      if (n === 0) name = 'Watch it :'; else if (
        n === 1) name = 'Effect it :'; else if (
        n === 2) name = 'Do it :'; else name = 'Effect Do it :'
      console.log(name)
      console.log(value)
    })
  }

  returnit.loops = function loops (log) {
    // returning the status of stored intervals
    if (returnit.defaults.watch_loop) log = true; else log = false
    console.log(returnit.defaults.watch_loop)
    console.log('Watch is : ' + log)
    if (returnit.defaults.effect_loop) log = true; else log = false
    console.log('Effect is : ' + log)
    if (returnit.defaults.doit_loop) log = true; else log = false
    console.log('Do is : ' + log)
    if (returnit.defaults.effectdo_loop) log = true; else log = false
    console.log('Effect Do is : ' + log)
  }

// We are done

  returnit.exit = function exit () {
    // cleaning up
    abort()
    clearParse()
  }

// initiating and returning the class

  __init__()
  return returnit
}
