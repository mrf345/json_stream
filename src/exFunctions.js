const exFunctions = {
  // Pythonic and validation functions
  checkType: function checkType (type, args) {
    // checking the type of each varible in the passed array
    for (let a in args) {
      if (typeof args[a] !== type) return false
    }
    return true
  },
  checkBool: function checkBool (args) {
    // check if passed args are 'true' or 'false' type
    for (let a in args) {
      if (args[a] !== 'true' && args[a] !== 'false') return false
    }
    return true
  },
  choice: function choice (list) {
  // to chose randomly from an Array
    if (!(list instanceof Array)) throw new TypeError('choice() taskes only Arrays')
    if (list.length <= 0) throw new Error('choice() requires pupliated Array')
    let powerOfLength = Math.floor(list.length / 10)
    if (powerOfLength <= 0) powerOfLength = 1
    return list[Math.floor(Math.random() * (10 * powerOfLength))]
  },
  effects: [
    // jquery UI motion effects
    'blind', 'bounce', 'clip',
    'drop', 'explode', 'fade',
    'fold', 'highlight', 'puff',
    'pulsate', 'scale', 'shake',
    'size', 'slide'
  ]
}
export default exFunctions
