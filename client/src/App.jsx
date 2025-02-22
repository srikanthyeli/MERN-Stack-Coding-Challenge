import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { TailSpin } from "react-loader-spinner";
import "./App.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function App() {
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const baseUrl = "http://localhost:3000";
        if (page === 1 && !transactions.length) {
          await axios.get(`api/init`);
        }

        const [transRes, combinedRes] = await Promise.all([
          axios.get(`${baseUrl}/api/transactions`, {
            params: { month, search, page, perPage },
          }),
          axios.get(`${baseUrl}/api/combined`, { params: { month } }),
        ]);

        setTransactions(transRes.data.transactions || []);
        setTotal(transRes.data.total || 0);
        setStats(combinedRes.data.statistics || {});
        setBarData(combinedRes.data.barChart || []);
        setPieData(combinedRes.data.pieChart || []);
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "Failed to load data. Please ensure the backend is running."
        );
        console.error("Fetch Error:", error.response || error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [month, search, page, perPage, transactions.length]);

  const renderBarChart = () => (
    <div className="Charts-BarChart charts-graph-list-margin charts-graph-red">
      <h2 className="Charts-graph-heading">Price Range Distribution - {month}</h2>
      <BarChart
        width={700}
        height={400}
        data={barData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={40}
      >
        <XAxis
          dataKey="range"
          stroke="#9A0E31"
          style={{ fontFamily: "Roboto", fontWeight: 500, textTransform: "uppercase" }}
          dy={10}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="count"
          fill="#9A0E31"
          label={{ position: "top", fill: "#9A0E31" }}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </div>
  );

  const renderPieChart = () => (
    <div className="Charts-PieChart charts-graph-list-margin charts-graph-blue">
      <h2 className="Charts-graph-heading">Category Distribution - {month}</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={pieData}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );

  return (
    <div className="App">
      <h1 className="Charts-graph-heading">Transaction Dashboard</h1>

      <div className="controls">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="loading-class">
          <TailSpin
            height="50"
            width="50"
            color="#007BFF"
            ariaLabel="tail-spin-loading"
            radius="1"
            visible={true}
          />
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="Charts-container">
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Sold</th>
                  <th className="table-header">Image</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="table-row">
                      <td className="table-cell">{t.id}</td>
                      <td className="table-cell">{t.title}</td>
                      <td className="table-cell">{t.description}</td>
                      <td className="table-cell">{t.price}</td>
                      <td className="table-cell">{t.category}</td>
                      <td className="table-cell">{t.sold ? "Yes" : "No"}</td>
                      <td className="table-cell image-size">
                        <img src={t.image} alt={t.title} width="100vw" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="table-cell no-data">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pagination">
              <button className=" btn-1"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * perPage >= total}
              >
                Next
              </button>
            </div>
          </div>

          <div className="stats charts-graph-list-margin charts-graph-green">
            <h2 className="Charts-graph-heading">Statistics - {month}</h2>
            <p className="sales">Total Sale: ${stats.totalSale || 0}</p>
            <p className="sold">Total Sold Items: {stats.soldItems || 0}</p>
            <p className="notsold">Total Not Sold Items: {stats.notSoldItems || 0}</p>
          </div>

          {renderBarChart()}
          {renderPieChart()}
        </div>
      )}
    </div>
  );
}

export default App;