import React from "react";
import { Input } from "./Input";

interface SearchProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
}

export const SearchBar: React.FC<SearchProps> = ({
  placeholder,
  value,
  onChangeText,
  isDark = false,
}) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      isDark={isDark}
      containerStyle={{ marginBottom: 0 }}
    />
  );
};
