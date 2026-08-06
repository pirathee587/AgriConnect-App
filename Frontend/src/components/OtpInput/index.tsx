import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface OtpInputProps {
  codeLength?: number;
  onCodeChanged: (code: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  codeLength = 6,
  onCodeChanged,
}) => {
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const inputs = useRef<TextInput[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Only numeric input
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    const fullCode = newCode.join('');
    onCodeChanged(fullCode);

    if (cleanText && index < codeLength - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      onCodeChanged(newCode.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {Array(codeLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            style={[
              styles.input,
              code[index] ? styles.inputFilled : {},
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={code[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            textAlign="center"
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  input: {
    width: 48,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: '#ffffff',
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  inputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ffffff',
  },
});

export default OtpInput;
