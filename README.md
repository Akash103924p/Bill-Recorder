# Auto Bill Recorder

A professional web application for recording and managing bills with advanced features including voice input, dark/light themes, and comprehensive analytics.

## Features

### Core Functionality
- **Add Products**: Enter product details with name, price, quantity, and category
- **Generate Bills**: Create bills with automatic total calculation and date tracking
- **Bill History**: View, print, and manage all previous bills
- **Indian Currency**: All amounts displayed and calculated in Indian Rupees (₹)

### Advanced Features
- **Voice Input**: Add products using voice commands (Chrome/Edge browsers)
- **Dark/Light Mode**: Toggle between themes with automatic font changes
- **PDF Printing**: Print bills directly or save as PDF
- **Local Storage**: All data saved locally in the browser

### Analytics & Reports
- **Dashboard**: Overview statistics including total bills, expenses, and averages
- **Monthly Reports**: Comprehensive expense analysis with multiple chart types:
  - Pie Chart: Category-wise expense distribution
  - Bar Chart: Monthly expense comparison
  - Line Chart: Cumulative expense trend
  - Column Chart: Daily expenses over last 30 days

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for loading external libraries

### Installation
1. Download all files to a local directory
2. Open `index.html` in your web browser
3. The application is ready to use!

### Usage

#### Adding Products
1. Navigate to "ADD PRODUCTS" tab
2. Fill in product details:
   - Product Name (required)
   - Price in ₹ (required)
   - Quantity (required, default: 1)
   - Category (optional)
3. Click "+ ADD PRODUCT" or use "VOICE INPUT"
4. Repeat for all products
5. Click "GENERATE BILL" when complete

#### Managing Bills
- View all bills in "BILL HISTORY" tab
- Click "View" to see bill details
- Click "Print" to print or save as PDF
- Click "Delete" to remove bills

#### Analytics
- Check "DASHBOARD" for overview statistics
- Visit "MONTHLY REPORTS" for detailed charts and analysis

#### Theme Settings
- Click the moon/sun icon in the header to toggle themes
- Dark mode uses different fonts for better readability
- Theme preference is saved automatically

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables and animations
- **Vanilla JavaScript**: No framework dependencies
- **Chart.js**: Interactive charts and graphs
- **jsPDF**: PDF generation for printing
- **Web Speech API**: Voice input functionality

### Data Storage
- All data stored in browser's LocalStorage
- No server or database required
- Data persists between sessions
- Export functionality available for backup

### Browser Compatibility
- Chrome/Edge: Full feature support including voice input
- Firefox/Safari: All features except voice input
- Mobile browsers: Responsive design supported

## File Structure

```
auto-bill-recorder/
├── index.html          # Main application file
├── styles.css          # Complete styling with theme support
├── script.js           # Application logic and functionality
└── README.md          # This documentation file
```

## Features in Detail

### Product Categories
- General
- Food
- Electronics
- Clothing
- Groceries
- Medicine
- Other

### Chart Types
1. **Pie Chart**: Shows expense distribution by category
2. **Bar Chart**: Compares expenses across different months
3. **Line Chart**: Displays cumulative expense trend over time
4. **Column Chart**: Shows daily expenses for the last 30 days

### Dashboard Statistics
- Total number of bills generated
- Total expenses across all bills
- Average bill amount
- Current month's total expenses

## Security & Privacy

- All data stored locally on user's device
- No data transmitted to external servers
- No tracking or analytics collection
- Complete data privacy and control

## Troubleshooting

### Voice Input Not Working
- Ensure you're using Chrome or Edge browser
- Grant microphone permissions when prompted
- Check if your device has a working microphone

### Charts Not Displaying
- Check internet connection for loading Chart.js library
- Refresh the page and try again
- Clear browser cache if issues persist

### Data Not Saving
- Ensure browser allows LocalStorage
- Check if browser is in private/incognito mode
- Try refreshing the page and re-entering data

## Future Enhancements

- Export data to Excel/CSV
- Multi-currency support
- User profiles and authentication
- Cloud synchronization
- Mobile app version
- Advanced filtering and search
- Bulk product import
- Receipt scanning with OCR

## Support

For issues, suggestions, or contributions, please contact the developer.

---

**Made by Akash Mahato**

*Professional Bill Management Solution*
