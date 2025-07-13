import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Send, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMultiTransactions } from '@/utils/octraWallet';

const MultiSend = () => {
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const exampleInput = `octABC123defGHI456jklMNO789pqrSTU012vwxYZ345abc:100.5
octDEF456ghiJKL789mnoPQR012stuVWX345yzaBC678def:50.25
octGHI789jklMNO012pqrSTU345vwxYZ678abcDEF901ghi:75.00`;

  const parseInput = () => {
    const lines = rawInput.trim().split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [address, amount] = line.split(':').map(x => x.trim());
      return { address, amount };
    });
  };

  const validateInput = () => {
    if (!rawInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter transaction data',
        variant: 'destructive'
      });
      return false;
    }

    const transactions = parseInput();
    if (transactions.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid transactions found',
        variant: 'destructive'
      });
      return false;
    }

    for (const tx of transactions) {
      if (!tx.address || !tx.amount) {
        toast({
          title: 'Error',
          description: 'Invalid format. Use: address:amount',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;

    try {
      setLoading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await sendMultiTransactions(rawInput);

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response);

      if (response.success.length > 0) {
        toast({
          title: "Multi-send Completed",
          description: `${response.success.length} transactions sent successfully, ${response.failed.length} failed`
        });
      } else {
        toast({
          title: "All Transactions Failed",
          description: "No transactions were processed successfully",
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Multi-send Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const resetForm = () => {
    setRawInput('');
    setResult(null);
    setProgress(0);
  };

  const loadExample = () => {
    setRawInput(exampleInput);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
       </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Input Form */}
          <Card className="order-1">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Send className="h-5 w-5" />
                Batch Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    Enter one transaction per line in format: <code className="bg-blue-100 px-1 rounded">address:amount</code>
                    <br />
                    Example: <code className="bg-blue-100 px-1 rounded">oct123...xyz:100.5</code>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label htmlFor="transactions" className="text-sm font-medium">
                      Transaction List
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadExample}
                      className="w-fit self-end sm:self-auto"
                    >
                      Load Example
                    </Button>
                  </div>
                  <Textarea
                    id="transactions"
                    placeholder="oct123...xyz:100.5&#10;oct456...abc:50.25"
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    rows={8}
                    className="font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {parseInput().length} transactions detected
                  </p>
                </div>

                {loading && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm text-blue-800">
                      <span>Processing transactions...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-2" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send All
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="sm:w-auto"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="order-2">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{result.success.length}</div>
                      <div className="text-xs sm:text-sm text-green-700">Successful</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">{result.failed.length}</div>
                      <div className="text-xs sm:text-sm text-red-700">Failed</div>
                    </div>
                  </div>

                  {/* Successful Transactions */}
                  {result.success.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-600 flex items-center gap-2 text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4" />
                        Successful Transactions
                      </h3>
                      <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {result.success.map((tx: any, index: number) => (
                          <div key={index} className="p-2 bg-green-50 rounded border border-green-200 text-sm">
                            <div className="font-mono text-xs truncate">{tx.to.slice(0, 12)}...{tx.to.slice(-8)}</div>
                            <div className="text-green-700 font-medium">{tx.amount} OCT</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed Transactions */}
                  {result.failed.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-600 flex items-center gap-2 text-sm sm:text-base">
                        <AlertCircle className="h-4 w-4" />
                        Failed Transactions
                      </h3>
                      <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {result.failed.map((tx: any, index: number) => (
                          <div key={index} className="p-2 bg-red-50 rounded border border-red-200 text-sm">
                            <div className="font-mono text-xs truncate">{tx.to.slice(0, 12)}...{tx.to.slice(-8)}</div>
                            <div className="text-red-700">{tx.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6 sm:py-8">
                  <Send className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Results will appear here after processing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MultiSend;
