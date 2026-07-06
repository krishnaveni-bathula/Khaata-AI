import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function Customers({ backendUrl = 'http://localhost:5000' }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setErrorText('');
    try {
      const response = await fetch(`${backendUrl}/api/transactions`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction ledger from backend.');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setErrorText(err.message || 'Error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [backendUrl]);

// Levenshtein distance helper for phonetic/fuzzy name matching
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

  // Aggregate per customer: customer_name => net credit (owes - paid) + list of transactions
  const customerMap = {};
  transactions.forEach((tx) => {
    const rawName = tx.customer_name.trim();
    const normalizedName = rawName.toLowerCase().replace(/\s+/g, '');
    
    // Find the best matching key based on exact or auto-merge rules
    let matchedKey = null;
    let minDistance = Infinity;
    
    for (const key of Object.keys(customerMap)) {
      if (key === normalizedName) {
        matchedKey = key;
        break;
      }
      
      const dist = levenshteinDistance(key, normalizedName);
      const maxLen = Math.max(key.length, normalizedName.length);
      
      // Auto-merge strict thresholds:
      // - 1 character difference for names of length >= 4
      // - 2 character differences for names of length >= 6
      const canAutoMerge = (dist === 1 && maxLen >= 4) || (dist === 2 && maxLen >= 6);
      
      if (canAutoMerge && dist < minDistance) {
        minDistance = dist;
        matchedKey = key;
      }
    }
    
    if (matchedKey) {
      // Merge into existing customer group
      // Casing/Spacing preference: if the new name has a space and the existing doesn't, update display name
      if (rawName.includes(' ') && !customerMap[matchedKey].name.includes(' ')) {
        customerMap[matchedKey].name = rawName;
      }
      const value = tx.action === 'owe' ? tx.amount : -tx.amount;
      customerMap[matchedKey].netDebt += value;
      customerMap[matchedKey].transactions.push(tx);
    } else {
      // Create new customer group
      customerMap[normalizedName] = {
        name: rawName,
        netDebt: tx.action === 'owe' ? tx.amount : -tx.amount,
        transactions: [tx]
      };
    }
  });

  // Convert to array and filter + sort
  const customerList = Object.values(customerMap)
    .filter((customer) => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.netDebt - a.netDebt); // Sort by highest debt first

  const toggleExpand = (name) => {
    if (expandedCustomer === name) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(name);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-20px bg-background text-on-background pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">Customer Ledger</h1>
          <p className="text-xs text-on-surface-variant font-sans mt-0.5">
            Credit and payment aggregates per customer
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="w-10 h-10 bg-surface-container hover:bg-primary/10 rounded-full flex items-center justify-center text-on-surface-variant transition-colors active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/60" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-12 pr-4 py-3 border border-surface-container rounded-3xl bg-surface-container-lowest text-on-background font-sans text-sm focus:outline-none focus:border-primary shadow-premium-sm"
        />
      </div>

      {/* Main List */}
      <div className="flex-1">
        {isLoading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <span className="text-sm text-on-surface-variant font-medium font-sans">Loading ledger...</span>
          </div>
        ) : errorText ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <span className="text-sm font-bold text-red-700 block font-sans">Connection Error</span>
              <span className="text-xs text-red-600 font-sans">{errorText}</span>
            </div>
          </div>
        ) : customerList.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest border border-surface-container rounded-3xl p-6">
            <p className="text-sm text-on-surface-variant font-sans">
              {searchQuery ? 'No customers match your search.' : 'No transactions found. Record your first voice entry on the Home tab!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customerList.map((customer) => {
              const owesMoney = customer.netDebt > 0;
              const isExpanded = expandedCustomer === customer.name;

              return (
                <div
                  key={customer.name}
                  className="bg-surface-container-lowest border border-surface-container shadow-premium-sm rounded-3xl overflow-hidden transition-all duration-200"
                >
                  {/* Summary Card */}
                  <div
                    onClick={() => toggleExpand(customer.name)}
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-lg font-sans text-on-background">
                        {customer.name}
                      </h3>
                      <span className="text-xs text-on-surface-variant font-sans block mt-0.5">
                        {customer.transactions.length} transaction{customer.transactions.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`block font-bold text-xl font-sans ${owesMoney ? 'text-primary' : customer.netDebt < 0 ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                          {owesMoney ? `₹${customer.netDebt.toFixed(2)}` : customer.netDebt < 0 ? `-₹${Math.abs(customer.netDebt).toFixed(2)}` : '₹0.00'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">
                          {owesMoney ? 'Owes You' : customer.netDebt < 0 ? 'Advance' : 'Settled'}
                        </span>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-on-surface-variant" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {isExpanded && (
                    <div className="bg-surface-container-low px-5 pb-5 pt-3 border-t border-surface-container space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Transaction History
                      </h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {customer.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-surface-container-lowest border border-surface-container p-3 rounded-2xl flex justify-between items-center text-sm shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.action === 'owe' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                              }`}>
                                {tx.action === 'owe' ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-on-background capitalize">
                                  {tx.action === 'owe' ? 'Credit' : 'Payment'}
                                </span>
                                <span className="text-[11px] text-on-surface-variant block">
                                  {new Date(tx.timestamp || tx.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <span className={`font-bold font-sans ${tx.action === 'owe' ? 'text-primary' : 'text-tertiary'}`}>
                              ₹{tx.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
