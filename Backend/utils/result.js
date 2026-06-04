// why we write these 
// 1. to avoid writing the same code again and again
// 2. to make the code more readable and maintainable
function createResult(err, data) {
    const result = {}
    if (data) {
        result.status = 'success'
        result.data = data
    }
    else {
        result.status = 'error'
        result.error = err
    }
    return result
}

module.exports = { createResult }