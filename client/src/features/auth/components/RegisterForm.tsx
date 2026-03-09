import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  nickName: string;
  urlAvatar: string;
  bio: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    nickName: "",
    urlAvatar: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.nickName) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gia nhập MAPIC 🚀</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={formData.username}
        onChangeText={(txt) => setFormData({ ...formData, username: txt })}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(txt) => setFormData({ ...formData, email: txt })}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={formData.password}
        onChangeText={(txt) => setFormData({ ...formData, password: txt })}
      />
      <TextInput
        style={styles.input}
        placeholder="Biệt danh (VD: YuuuuBin)"
        value={formData.nickName}
        onChangeText={(txt) => setFormData({ ...formData, nickName: txt })}
      />
      <TextInput
        style={styles.input}
        placeholder="Link ảnh đại diện (URL)"
        value={formData.urlAvatar}
        onChangeText={(txt) => setFormData({ ...formData, urlAvatar: txt })}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Giới thiệu bản thân"
        multiline
        value={formData.bio}
        onChangeText={(txt) => setFormData({ ...formData, bio: txt })}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#3498db",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
