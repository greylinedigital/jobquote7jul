import React, { useState } from 'react';
import Toast from './Toast';

interface EmailStatusToastProps {
  visible: boolean;
  success: boolean;
  message: string;
  onHide: () => void;
}

export default function EmailStatusToast({ 
  visible, 
  success, 
  message, 
  onHide 
}: EmailStatusToastProps) {
  return (
    <Toast
      visible={visible}
      message={message}
      type={success ? 'success' : 'error'}
      duration={success ? 4000 : 6000}
      onHide={onHide}
    />
  );
}