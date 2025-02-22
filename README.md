# MERN-Stack-Coding-Challenge
##### Loom Video link:https://www.loom.com/share/c2590eb0a7404f9abd0d3d913e1e6751?sid=bd95c5fa-fe12-458a-bcf5-c19ed63eb6c3

A full-stack transaction analytics dashboard built with React.js (frontend) and Node.js, Express.js, and SQLite3 (backend). This project fetches product transaction data, stores it in SQLite, and provides a dashboard with tables, statistics, and charts (bar and pie) to analyze sales by month.

**Note**: Despite the "MERN" label, this project uses SQLite instead of MongoDB for simplicity.

## Features
- **Transaction Table**: Filter transactions by month and search term, with pagination.
- **Statistics**: Displays total sales, sold items, and unsold items for a selected month.
- **Charts**: Bar chart for price range distribution and pie chart for category breakdown.
- **Data Source**: Initializes data from [this JSON file](https://s3.amazonaws.com/roxiler.com/product_transaction.json).




## Prerequisites
- **Node.js** (v16 or later)
- **npm** (v8 or later)
- **Git**

## Local Setup
### 1. Clone the Repository
```bash
git clone https://github.com/srikanthyeli/MERN-Stack-Coding-Challenge.git
cd MERN-Stack-Coding-Challenge



### Notes
- **Structure**: Assumes `client/` and `server/` are separate initially, combined for deployment. Adjust paths if your repo differs.
- **SQLite**: Highlights persistence with Render’s disk feature—critical since the ephemeral filesystem resets otherwise.
- **Instructions**: Covers both local dev and deployment, making it beginner-friendly.
- **Customization**: Add a `LICENSE` file or tweak sections (e.g., add screenshots) to polish it.

To add this to your GitHub repo:
1. Create or edit `README.md` in the root directory.
2. Copy-paste the above content.
3. Commit and push:
   ```bash
   git add README.md
   git commit -m "Add README with setup and deployment instructions"
   git push origin main


