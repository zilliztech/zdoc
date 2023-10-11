

class larkUtils {
    constructor(docs, instance_type, condition = true, return_parent = false) {
        this.docs = docs;
        this.instance_type = instance_type
        this.instances = [];
        this.instance_keys = [];
        this.condition = condition;
        this.return_parent = return_parent;
        this.__iterateObject(this.docs, this.instance_type);
    }

    __iterateObject(obj, target_property, keys = []) {
        for (let key in obj) {
            if (key !== target_property && typeof obj[key] === 'object') {
                this.__iterateObject(obj[key], target_property, [...keys, key]);
            } else if (Array.isArray(obj[key])) {
                for (let i = 0; i < obj[key].length; i++) {
                    if (typeof obj[key][i] === 'object') {
                        this.__iterateObject(obj[key][i], target_property, [...keys, key, i]);
                    }
                }
            } else if (key === target_property && eval(this.condition)) {
                if (this.return_parent) {
                    this.instances.push(obj);
                    this.instance_keys.push(this.__joinKeys([...keys]));
                } else {
                    this.instances.push(obj[key]);
                    this.instance_keys.push(this.__joinKeys([...keys, key]));
                }
            }
        }
    }

    __joinKeys(keys) {
        let result = '';
        for (let key of keys) {
            if (key.match(/^\d+$/)) {
                result += `[${parseInt(key)}]`;
            } else {
                result += `.${key}`;
            }
        }
        return result;
    }
}

module.exports = larkUtils;