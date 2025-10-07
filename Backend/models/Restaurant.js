import mongoose from 'mongoose';

/*
name: Restaurant name (unique across the campus).

menuItems: Array of menu items with nutrition details.

nutrition: Contains protein, carbs, and fats values (in grams).

isOpen and hours: Track operational status and hours.

timestamps: Automatically adds createdAt and updatedAt.
*/

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  menuItems: [
    {
      itemName: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'],
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      nutrition: {
        protein: { type: Number, required: true, min: 0 },
        carbs: { type: Number, required: true, min: 0 },
        fats: { type: Number, required: true, min: 0 }
      }
    }
  ],
  hours: {
    type: Map,
    of: new mongoose.Schema({
      open: { type: String, default: '08:00 AM' },
      close: { type: String, default: '08:00 PM' }
    }, { _id: false }),
    default: {
      Monday: { open: '08:00 AM', close: '08:00 PM' },
      Tuesday: { open: '08:00 AM', close: '08:00 PM' },
      Wednesday: { open: '08:00 AM', close: '08:00 PM' },
      Thursday: { open: '08:00 AM', close: '08:00 PM' },
      Friday: { open: '08:00 AM', close: '08:00 PM' },
      Saturday: { open: '08:00 AM', close: '08:00 PM' },
      Sunday: { open: '08:00 AM', close: '08:00 PM' }
    }
  }
}, { timestamps: true });

// Virtual field to compute if restaurant is open right now
restaurantSchema.virtual('isOpen').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const dayName = days[now.getDay()]; // current day as string

  const hoursToday = this.hours.get(dayName);
  if (!hoursToday) return false; // no hours set for today

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes; // total minutes since midnight
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTime(hoursToday.open);
  const closeMinutes = parseTime(hoursToday.close);

  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
});

// Make virtuals included in JSON output
restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;