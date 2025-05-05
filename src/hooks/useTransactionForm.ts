import { useState, useEffect } from "react";
import { calculateFee, convertCurrency, DEFAULT_EXCHANGE_RATES } from "@/lib/utils";
import { fetchExchangeRates } from "@/lib/api";

interface TransactionForm {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAccountId: string;
}

interface TransactionSummary {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  fee: number;
  totalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  estimatedDeliveryTime: string;
}

const DEFAULT_FORM_VALUES: TransactionForm = {
  amount: 1000,
  fromCurrency: "USD",
  toCurrency: "MXN",
  recipientName: "",
  recipientEmail: "",
  recipientPhone: "",
  recipientAccountId: "",
};

export function useTransactionForm() {
  const [formValues, setFormValues] = useState<TransactionForm>(DEFAULT_FORM_VALUES);
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch rates when currency changes
  useEffect(() => {
    if (formValues.fromCurrency) {
      fetchRates(formValues.fromCurrency);
    }
  }, [formValues.fromCurrency]);

  const fetchRates = async (baseCurrency: string) => {
    setIsLoadingRates(true);
    try {
      const rates = await fetchExchangeRates(baseCurrency);
      setExchangeRates(rates);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleInputChange = (field: keyof TransactionForm, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const calculateTransactionSummary = (): TransactionSummary => {
    const { amount, fromCurrency, toCurrency } = formValues;
    const fee = calculateFee(amount);
    const totalAmount = amount + fee;
    const exchangeRate = exchangeRates[toCurrency] || DEFAULT_EXCHANGE_RATES[toCurrency];
    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency, exchangeRates);

    return {
      amount,
      fromCurrency,
      toCurrency,
      fee,
      totalAmount,
      convertedAmount,
      exchangeRate,
      estimatedDeliveryTime: "< 1 second",
    };
  };

  const prepareTransactionSummary = () => {
    const summary = calculateTransactionSummary();
    setTransactionSummary(summary);
    goToNextStep();
  };

  const resetForm = () => {
    setFormValues(DEFAULT_FORM_VALUES);
    setCurrentStep(1);
    setTransactionSummary(null);
  };

  const submitTransaction = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      goToNextStep();
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    handleInputChange,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    prepareTransactionSummary,
    transactionSummary,
    resetForm,
    isSubmitting,
    submitTransaction,
    isLoadingRates,
    exchangeRates,
  };
} 