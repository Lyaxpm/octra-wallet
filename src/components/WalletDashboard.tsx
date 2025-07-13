import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBalance, getTransactionHistory, ADDRESS } from '@/utils/octraWallet';
import {
  Wallet,
  Send,
  History,
  Download,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  hash?: string;
  epoch?: number;
  url?: string;
}

const WalletDashboard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, historyData] = await Promise.all([
        getBalance(),
        getTransactionHistory()
      ]);
      setBalance(balanceData);
      setTransactions(historyData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(ADDRESS);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard"
    });
  };

  const formatAmount = (amount: string | number) => {
    return typeof amount === 'string' ? parseFloat(amount).toFixed(2) : amount.toFixed(2);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateHash = (hash: string, mobile: boolean = false) => {
    if (mobile) {
      return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    }
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Octra Wallet
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Octra Wallet Browser</p>
        </div>

        {/* Balance Card */}
        <Card className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2 text-white/90">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Wallet Balance</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceHidden(!balanceHidden)}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadData}
                  disabled={loading}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pt-0 pb-6">
            <div className="text-center sm:text-left mb-6">
              <div className="relative inline-block">
                <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  {loading ? (
                    <div className="flex items-center justify-center sm:justify-start">
                      <div className="animate-pulse bg-white/20 h-8 sm:h-10 lg:h-12 w-32 sm:w-40 lg:w-48 rounded"></div>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                      <span>{balanceHidden ? '****' : formatAmount(balance)}</span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-medium text-white/80">OCT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-white/70 mb-1">Wallet Address</div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs sm:text-sm text-white break-all sm:break-normal">
                      <span className="hidden lg:inline">{ADDRESS}</span>
                      <span className="hidden sm:inline lg:hidden">{ADDRESS.slice(0, 20)}...{ADDRESS.slice(-20)}</span>
                      <span className="sm:hidden">{truncateAddress(ADDRESS)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors self-start sm:self-center"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-white/70">Transactions</div>
                <div className="text-sm font-semibold text-white">{transactions.length}</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-white/70">Network</div>
                <div className="text-sm font-semibold text-blue-200">Octra</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            className="h-14 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/send')}
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Send Transaction
          </Button>
          <Button
            variant="outline"
            className="h-14 sm:h-16 text-sm sm:text-base border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            onClick={() => navigate('/multi-send')}
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Multi Send
          </Button>
          <Button
            variant="outline"
            className="h-14 sm:h-16 text-sm sm:text-base border-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 sm:col-span-2 lg:col-span-1"
            onClick={() => navigate('/export')}
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Export Wallet
          </Button>
        </div>

        {/* Transaction History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-muted-foreground text-sm sm:text-base">Loading transactions...</p>
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No transactions found</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((tx, idx) => {
                  if (!tx.hash || !tx.url) return null;

                  return (
                    <div key={tx.hash + idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs w-fit">
                            Epoch {tx.epoch ?? '—'}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono break-all">
                            <span className="hidden sm:inline">{tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}</span>
                            <span className="sm:hidden">{truncateHash(tx.hash, true)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm text-muted-foreground">Hash</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.hash.slice(0, 12)}...
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
