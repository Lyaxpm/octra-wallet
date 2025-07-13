import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendTransaction, validateAddress, getBalance } from '@/utils/octraWallet';
import { Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SendTransaction = () => {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (result) setResult(null);
  };

  const validateForm = () => {
    if (!formData.to.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient address",
        variant: "destructive"
      });
      return false;
    }
    
    if (!validateAddress(formData.to)) {
      toast({
        title: "Error", 
        description: "Invalid Octra address format",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.amount.trim() || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const balance = await getBalance();
      if (balance < Number(formData.amount)) {
        throw new Error('Insufficient balance');
      }

      const response = await sendTransaction(
        formData.to,
        formData.amount,
        formData.message
      );

      setResult({
        success: true,
        data: response
      });

      toast({
        title: "Success!",
        description: "Transaction sent successfully"
      });

    } catch (error) {
      const errorMsg = error.message;
      setResult({
        success: false,
        error: errorMsg
      });

      toast({
        title: "Transaction Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ to: '', amount: '', message: '' });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg">Send OCT Tokens</span>
             </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {result ? (
              <div className="space-y-4">
                <Alert className={`border-2 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                      {result.success ? (
                        <div>
                          <strong className="text-lg">Transaction Successful!</strong>
                          <div className="mt-2 space-y-1">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Transaction ID:</span>
                              <code className="bg-green-100 px-2 py-1 rounded text-sm">{result.data.txId}</code>
                            </p>
                            <p>Sent <span className="font-medium">{formData.amount} OCT</span> to <span className="font-mono text-sm">{formData.to.slice(0, 12)}...</span></p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <strong className="text-lg">Transaction Failed</strong>
                          <p className="mt-1">{result.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={resetForm} 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Send Another Transaction
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-sm font-medium text-gray-700">
                    Recipient Address *
                  </Label>
                  <Input
  id="to"
  placeholder="oct1abc..."
  value={formData.to}
  onChange={(e) => handleInputChange('to', e.target.value)}
  className="font-mono border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors duration-200"
/>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount (OCT) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="pr-12 border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors duration-200"
                    />
                    <div className="absolute right-3 top-3 text-gray-500 text-sm font-medium">
                      OCT
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter transaction message..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={3}
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors duration-200 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending Transaction...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Transaction
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendTransaction;
