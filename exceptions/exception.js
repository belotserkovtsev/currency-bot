
class Exception {
    constructor(id, message, input = 'No input found'){
        this.id = id;
        this.message = message;
        this.input = input;
    }
}

module.exports = Exception;