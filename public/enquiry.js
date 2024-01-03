const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  Name: String,
  
  mobile: String,
  email: String,
  textArea: String,
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
