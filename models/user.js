const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create a schema
const userSchema = new Schema({
    method: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        // required: true
    },
    local: {
        id:Schema.Types.ObjectId,
        email: {
            type: String,
            lowercase: true 
        },
        password: {
            type: String,
        },
        name: {
            type: String
        },
        majors: {
            type: String
        },
        photos: {
            type: String
        }
    },
    google: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        }
    },
    facebook: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        }
    }    
});

userSchema.pre('save', async function(next) {
    try {
        if(this.method !== 'local') {
            next();
        }
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Generate a hash
        const passwordHash = await bcrypt.hash(this.local.password, salt);
        // Plain text password
        this.local.password = passwordHash;
    } catch(error) {
        next(error);
    }
})

userSchema.methods.isValidPassword = async function(newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.local.password)
    } catch(error) {
        throw new Error(error);
    }
}

// Create a model
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;