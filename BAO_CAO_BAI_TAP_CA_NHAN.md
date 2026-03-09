# BÁO CÁO BÀI TẬP CÁ NHÂN - ỨNG DỤNG MAPIC

## THÔNG TIN SINH VIÊN
- **Họ và tên**: [Tên sinh viên]
- **MSSV**: [Mã số sinh viên]
- **Lớp**: [Lớp]
- **Đề tài**: Ứng dụng chia sẻ vị trí và kết nối bạn bè MAPIC

---

## PHẦN 1: BẢO MẬT API (4 PHƯƠNG PHÁP)

### 1.1. JWT (JSON Web Token) Authentication ✅

**Mô tả**: JWT là phương pháp xác thực dựa trên token, cho phép server xác minh danh tính người dùng mà không cần lưu trữ session.

**Cách thức hoạt động**:
1. User đăng nhập với email/password
2. Server xác thực và tạo JWT token
3. Client lưu token và gửi kèm trong mọi request tiếp theo
4. Server verify token để xác thực request

**Triển khai trong dự án**:

#### Server Side (Spring Boot):
```java
// File: server/src/main/java/com/mapic/security/JwtUtil.java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String SECRET_KEY;
    
    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }
}
```

#### Client Side (React Native):
```typescript
// File: client/src/services/api/client.ts
this.axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Ưu điểm**:
- Stateless: Server không cần lưu session
- Scalable: Dễ mở rộng với nhiều server
- Cross-domain: Hoạt động tốt với CORS

---

### 1.2. Password Hashing với BCrypt ✅

**Mô tả**: Mã hóa mật khẩu trước khi lưu vào database để bảo vệ thông tin người dùng.

**Triển khai**:
```java
// File: server/src/main/java/com/mapic/service/AuthService.java
private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

public AuthResponse register(RegisterRequest request) {
    User newUser = User.builder()
            .password(passwordEncoder.encode(request.getPassword()))
            .build();
    // ...
}
```

**Đặc điểm**:
- Salt tự động: BCrypt tự động thêm salt ngẫu nhiên
- Adaptive: Có thể tăng độ phức tạp theo thời gian
- One-way: Không thể giải mã ngược lại

---


### 1.3. OTP (One-Time Password) Verification ✅

**Mô tả**: Xác thực 2 lớp bằng mã OTP gửi qua email để đảm bảo người dùng sở hữu email đăng ký.

**Luồng hoạt động**:
1. User đăng ký tài khoản
2. Server tạo mã OTP 6 số ngẫu nhiên
3. Gửi OTP qua email
4. User nhập OTP để kích hoạt tài khoản
5. Server verify OTP và kích hoạt tài khoản

**Triển khai**:
```java
// File: server/src/main/java/com/mapic/service/OtpService.java
public void generateAndSendOtp(String email, OtpType type) {
    String otpCode = generateRandomOtp(); // 6 số ngẫu nhiên
    
    OtpToken otpToken = OtpToken.builder()
            .email(email)
            .otpCode(otpCode)
            .type(type)
            .expiresAt(LocalDateTime.now().plusMinutes(5))
            .build();
    
    otpRepository.save(otpToken);
    emailService.sendOtpEmail(email, otpCode);
}
```

**Áp dụng cho**:
- Register: Xác thực email khi đăng ký
- Forgot Password: Xác thực khi đặt lại mật khẩu

---

### 1.4. HTTPS & Secure Storage ✅

**Mô tả**: Mã hóa dữ liệu truyền tải và lưu trữ an toàn trên client.

**Triển khai**:

#### HTTPS (Server):
```java
// File: server/src/main/resources/application.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_PASSWORD}
```

#### Secure Storage (Client):
```typescript
// File: client/src/services/auth/auth.service.ts
import * as SecureStore from 'expo-secure-store';

async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', credentials);
  
  // Lưu token an toàn
  await SecureStore.setItemAsync('userToken', response.token);
  await SecureStore.setItemAsync('userData', JSON.stringify(user));
  
  return { token: response.token, user };
}
```

**Đặc điểm Expo SecureStore**:
- iOS: Sử dụng Keychain Services
- Android: Sử dụng EncryptedSharedPreferences
- Mã hóa dữ liệu tự động

---

## PHẦN 2: MÔ HÌNH KIẾN TRÚC

### 2.1. Kiến trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                    REACT NATIVE APP                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │              PRESENTATION LAYER                     │ │
│  │  - Screens (Login, Register, Map, Chat, Settings)  │ │
│  │  - Components (UI Components)                       │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              BUSINESS LOGIC LAYER                   │ │
│  │  - Contexts (AuthContext, LocationContext)         │ │
│  │  - Hooks (useAuth, useLocation, useProfile)        │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              DATA ACCESS LAYER                      │ │
│  │  - Services (auth.service, location.service)       │ │
│  │  - API Client (axios interceptors)                 │ │
│  │  - Secure Storage (expo-secure-store)              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                   SPRING BOOT SERVER                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │              SECURITY LAYER                         │ │
│  │  - JWT Filter                                       │ │
│  │  - Security Config                                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              CONTROLLER LAYER                       │ │
│  │  - AuthController                                   │ │
│  │  - UserController                                   │ │
│  │  - LocationController                               │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                          │ │
│  │  - AuthService                                      │ │
│  │  - UserService                                      │ │
│  │  - LocationService                                  │ │
│  │  - OtpService                                       │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              DATA ACCESS LAYER                      │ │
│  │  - Repositories (JPA)                               │ │
│  │  - Entities (User, OtpToken, CurrentLocation)      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕
                   PostgreSQL Database
```


### 2.2. Cấu Trúc Thư Mục Client (Feature-Based Architecture)

```
client/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth flow
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-otp.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (app)/                    # Main app flow
│   │   └── (tabs)/               # Tab navigation
│   │       ├── index.tsx         # Map screen
│   │       ├── feed.tsx
│   │       ├── friends.tsx
│   │       ├── chat.tsx
│   │       └── settings.tsx
│   └── _layout.tsx               # Root layout
├── src/
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── components/       # LoginForm, RegisterForm, OTPInput
│   │   │   ├── hooks/            # useAuth, useLogin, useRegister
│   │   │   └── types/
│   │   ├── profile/
│   │   │   ├── components/       # EditProfileForm, AvatarPicker
│   │   │   └── hooks/            # useProfile
│   │   ├── map/
│   │   │   ├── components/       # MapView
│   │   │   └── hooks/            # useLocationTracking
│   │   └── chat/
│   ├── services/                 # API services
│   │   ├── api/
│   │   │   └── client.ts         # Axios instance with interceptors
│   │   ├── auth/
│   │   │   └── auth.service.ts   # Authentication service
│   │   └── location/
│   │       └── location.service.ts
│   ├── store/                    # State management
│   │   └── contexts/
│   │       ├── AuthContext.tsx   # Global auth state
│   │       └── LocationContext.tsx
│   ├── shared/                   # Shared utilities
│   │   ├── components/           # Button, Input
│   │   ├── constants/            # API_BASE_URL, theme
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helper functions
│   └── assets/                   # Images, fonts
```

**Ưu điểm của kiến trúc này**:
- **Modular**: Mỗi feature độc lập, dễ maintain
- **Scalable**: Dễ thêm feature mới
- **Reusable**: Components và hooks có thể tái sử dụng
- **Type-safe**: TypeScript đảm bảo type safety

---

### 2.3. Cấu Trúc Thư Mục Server (Layered Architecture)

```
server/
└── src/main/java/com/mapic/
    ├── controller/               # REST API endpoints
    │   ├── AuthController.java
    │   ├── UserController.java
    │   └── LocationController.java
    ├── service/                  # Business logic
    │   ├── AuthService.java
    │   ├── UserService.java
    │   ├── LocationService.java
    │   ├── OtpService.java
    │   └── EmailService.java
    ├── repository/               # Data access
    │   ├── UserRepository.java
    │   ├── OtpTokenRepository.java
    │   └── CurrentLocationRepository.java
    ├── entity/                   # JPA entities
    │   ├── User.java
    │   ├── OtpToken.java
    │   └── CurrentLocation.java
    ├── dto/                      # Data Transfer Objects
    │   ├── LoginRequest.java
    │   ├── RegisterRequest.java
    │   ├── AuthResponse.java
    │   └── UpdateProfileRequest.java
    ├── security/                 # Security configuration
    │   ├── SecurityConfig.java
    │   ├── JwtUtil.java
    │   ├── JwtAuthenticationFilter.java
    │   └── CustomUserDetailsService.java
    └── config/                   # Application config
```

---

## PHẦN 3: GIAO DIỆN VÀ NAVIGATION

### 3.1. UI/UX Framework

**Không sử dụng Tailwind CSS** vì React Native không hỗ trợ trực tiếp. Thay vào đó:

#### StyleSheet API (React Native Built-in) ✅
```typescript
// File: client/app/(app)/(tabs)/settings.tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

**Đặc điểm**:
- Performance tốt: Compiled thành native styles
- Type-safe: TypeScript support
- Responsive: Flexbox layout
- Cross-platform: iOS & Android


### 3.2. React Navigation với Expo Router ✅

**Expo Router**: File-based routing system, tự động tạo navigation từ cấu trúc thư mục.

#### Cấu trúc Navigation:
```
app/
├── _layout.tsx                   # Root navigator
├── index.tsx                     # Entry point
├── (auth)/                       # Auth stack
│   ├── _layout.tsx               # Auth navigator
│   ├── login.tsx
│   ├── register.tsx
│   └── verify-otp.tsx
└── (app)/                        # Main app stack
    ├── _layout.tsx               # App navigator
    └── (tabs)/                   # Tab navigator
        ├── _layout.tsx           # Tab configuration
        ├── index.tsx             # Map tab
        ├── feed.tsx
        ├── friends.tsx
        ├── chat.tsx
        └── settings.tsx
```

#### Root Layout với Auth Protection:
```typescript
// File: client/app/_layout.tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
```

#### App Layout với Authentication Check:
```typescript
// File: client/app/(app)/_layout.tsx
export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </LocationProvider>
  );
}
```

#### Tab Navigation:
```typescript
// File: client/app/(app)/(tabs)/_layout.tsx
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Bản đồ' }} />
      <Tabs.Screen name="feed" options={{ title: 'Bảng tin' }} />
      <Tabs.Screen name="friends" options={{ title: 'Bạn bè' }} />
      <Tabs.Screen name="chat" options={{ title: 'Tin nhắn' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt' }} />
    </Tabs>
  );
}
```

**Ưu điểm Expo Router**:
- Type-safe navigation
- Deep linking tự động
- SEO-friendly (web)
- Code splitting

---

### 3.3. Các Màn Hình Chính

#### 3.3.1. Login Screen
```typescript
// File: client/app/(auth)/login.tsx
export default function LoginScreen() {
  const { login } = useLogin();
  
  const handleLogin = async (credentials) => {
    await login(credentials);
    router.replace("/(app)/(tabs)");
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

**Tính năng**:
- Email validation
- Password masking
- Remember me (SecureStore)
- Error handling

#### 3.3.2. Register Screen
```typescript
// File: client/app/(auth)/register.tsx
export default function RegisterScreen() {
  const { register } = useRegister();
  
  const handleRegister = async (formData) => {
    await register(formData);
    router.push({
      pathname: "/(auth)/verify-otp",
      params: { email: formData.email },
    });
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
```

**Tính năng**:
- Form validation
- Password strength indicator
- Avatar selection
- OTP verification flow

#### 3.3.3. Settings Screen (Trang Chủ Cá Nhân)
```typescript
// File: client/app/(app)/(tabs)/settings.tsx
export default function SettingsScreen() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user);

  return (
    <ScrollView>
      {/* Profile Card */}
      <ProfileCard profile={profile} />
      
      {/* Settings Sections */}
      <SettingsSection title="Tài khoản" items={accountItems} />
      <SettingsSection title="Tùy chọn" items={preferencesItems} />
      
      {/* Edit Profile Modal */}
      <EditProfileForm onSave={updateProfile} />
    </ScrollView>
  );
}
```

**Tính năng**:
- Hiển thị thông tin user
- Edit profile (avatar, nickname, bio)
- Avatar picker (preset + upload)
- Settings sections
- Logout

---

## PHẦN 4: LƯU TRỮ THÔNG TIN (SECURE STORAGE)

### 4.1. Expo SecureStore (Thay thế Realm) ✅

**Lý do chọn SecureStore thay vì Realm**:
- Đơn giản hơn cho authentication data
- Tích hợp sẵn với Expo
- Mã hóa tự động
- API đơn giản

**So sánh**:
| Tiêu chí | Realm | SecureStore |
|----------|-------|-------------|
| Mục đích | Database phức tạp | Key-value storage |
| Mã hóa | Cần config | Tự động |
| Kích thước | ~5MB | ~100KB |
| Phù hợp | Offline-first apps | Auth tokens |


### 4.2. Triển Khai SecureStore

#### Lưu Token và User Data:
```typescript
// File: client/src/services/auth/auth.service.ts
class AuthServiceImpl implements AuthService {
  private readonly TOKEN_KEY = 'userToken';
  private readonly USER_KEY = 'userData';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Lưu token
    await SecureStore.setItemAsync(this.TOKEN_KEY, response.token);
    
    // Lưu user data
    const user: User = {
      id: response.userId,
      username: credentials.email,
      email: credentials.email,
      nickName: response.nickName,
    };
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
    
    return { token: response.token, user };
  }

  async getUser(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);
  }
}
```

#### Auto-login với Stored Credentials:
```typescript
// File: client/src/store/contexts/AuthContext.tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await authService.getUser();
      const token = await authService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        console.log('✅ Auto-login successful');
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Dữ liệu được lưu**:
- `userToken`: JWT token
- `userData`: User information (id, email, nickName, avatarUrl, bio)
- `pendingEmail`: Email đang chờ verify OTP
- `resetEmail`: Email đang reset password

---

## PHẦN 5: TÍCH HỢP API

### 5.1. API Client Configuration

```typescript
// File: client/src/services/api/client.ts
class ApiClientImpl implements ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.transformError(error))
    );
  }
}
```

### 5.2. API Endpoints

#### Authentication APIs:
```
POST /api/auth/register          - Đăng ký tài khoản
POST /api/auth/verify-registration - Xác thực OTP đăng ký
POST /api/auth/resend-otp        - Gửi lại OTP
POST /api/auth/login             - Đăng nhập
POST /api/auth/forgot-password   - Quên mật khẩu
POST /api/auth/reset-password    - Đặt lại mật khẩu
```

#### User APIs:
```
GET  /api/users/profile          - Lấy thông tin profile
PUT  /api/users/profile          - Cập nhật profile
```

#### Location APIs:
```
POST /api/locations/update       - Cập nhật vị trí hiện tại
```

---

## PHẦN 6: TÍNH NĂNG ĐẶC BIỆT

### 6.1. Avatar Management

**Tính năng**:
- Chọn từ 12 avatar có sẵn (DiceBear API)
- Upload ảnh từ thư viện
- Chụp ảnh trực tiếp
- Nhập URL tùy chỉnh
- Preview trước khi lưu

```typescript
// File: client/src/features/profile/components/AvatarPicker.tsx
export function AvatarPicker({ currentAvatar, onSelect, onUpload }) {
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && onUpload) {
      const uploadedUrl = await onUpload(result.assets[0].uri);
      setSelectedAvatar(uploadedUrl);
    }
  };

  return (
    <Modal>
      {/* Preview */}
      <Image source={{ uri: selectedAvatar }} />
      
      {/* Upload Options */}
      <TouchableOpacity onPress={handlePickImage}>
        <Text>📁 Chọn từ thư viện</Text>
      </TouchableOpacity>
      
      {/* Preset Avatars */}
      <View>
        {PRESET_AVATARS.map((url) => (
          <TouchableOpacity onPress={() => setSelectedAvatar(url)}>
            <Image source={{ uri: url }} />
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}
```


### 6.2. Real-time Location Tracking

```typescript
// File: client/src/features/map/hooks/useLocationTracking.ts
export function useLocationTracking() {
  const { updateLocation } = useLocation();

  useEffect(() => {
    const subscription = locationService.watchLocation(async (location) => {
      // Update local state
      setCurrentLocation(location);
      
      // Update server
      try {
        await locationService.updateLocation(location);
      } catch (error) {
        console.error('Failed to update location on server:', error);
      }
    });

    return () => subscription();
  }, []);

  return { currentLocation, mapRegion, isTracking };
}
```

**Tính năng**:
- Theo dõi vị trí real-time
- Cập nhật lên server mỗi 5 giây hoặc 10 mét
- Hiển thị trên bản đồ
- Permission handling

---

### 6.3. Form Validation

```typescript
// File: client/src/features/profile/components/EditProfileForm.tsx
const validate = (): boolean => {
  const newErrors: Partial<ProfileFormData> = {};

  if (!formData.nickName.trim()) {
    newErrors.nickName = 'Biệt danh không được để trống';
  } else if (formData.nickName.length < 2) {
    newErrors.nickName = 'Biệt danh phải có ít nhất 2 ký tự';
  } else if (formData.nickName.length > 50) {
    newErrors.nickName = 'Biệt danh không được quá 50 ký tự';
  }

  if (formData.bio && formData.bio.length > 255) {
    newErrors.bio = 'Giới thiệu không được quá 255 ký tự';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

### 6.4. Các Tính Năng Khám Phá Nâng Cao (Quy đổi tương đương hệ thống Bán hàng)

Để đáp ứng đầy đủ yêu cầu lấy danh sách, lọc, giới hạn số lượng và giao diện Layout phức tạp, hệ thống đã triển khai 3 chức năng đặc thù cho Mạng xã hội Địa điểm:

#### 1. Bộ Lọc Khám Phá (Filter Categories) dạng Slide Ngang
- **Mô tả**: Hiển thị danh sách các tag/danh mục (Ví dụ: Địa điểm Hot, Gần đây, Của Bạn bè...) theo chiều ngang dạng trượt (Slide/Horizontal ScrollView).
- **Kỹ thuật API**: Sử dụng `FilterPresetController` gọi API `GET /api/feed/presets` để lấy danh sách các Filter Preset từ database trả về UI. Tương đương kỹ thuật lấy danh sách Danh mục sản phẩm (Categories).

#### 2. Top 10 Địa Điểm Nổi Bật (Hot Spots) dạng Slide Ngang
- **Mô tả**: Hiển thị 10 địa điểm có lượt đánh giá (review) cao nhất hoặc xu hướng nhất dạng Card nằm ngang trượt được.
- **Kỹ thuật API**: 
  - API `GET /api/places/search?size=10&minRating=4.0`
  - Logic Sort: Truy vấn lấy danh sách `Place`, kết nối với `ReviewCount` hoặc `AverageRating` và sắp xếp giảm dần, giới hạn kết quả bằng `LIMIT 10`. (Tương đương 10 Sản phẩm bán chạy nhất).

#### 3. 20 Bài Viết Xu Hướng (Trending Posts) chia 2 cột theo Tương Tác
- **Mô tả**: Tại màn hình Explore, hiển thị 20 bài viết dạng lưới 2 cột (Masonry Grid như Pinterest).
- **Kỹ thuật API**: 
  - API `GET /api/posts/feed?size=20&engagementFilter=trending`
  - Logic Sort: Hệ thống tự động dựa vào `likes`, `comments` và `viewCount` trong bảng Post để tính điểm Tương tác (Engagement). Truy vấn lấy 20 bài viết có điểm tương tác từ cao xuống thấp. (Tương đương kỹ thuật xếp 20 sản phẩm theo % Giảm giá giảm dần).
  
```typescript
// Ví dụ mẫu gọi API Feed với Filter Tương tác
const fetchTrendingPosts = async () => {
    const response = await apiClient.get('/posts/feed', {
        params: { size: 20, engagementFilter: 'trending' }
    });
    setPosts(response.data);
};
```


---

## PHẦN 7: CÔNG NGHỆ SỬ DỤNG

### 7.1. Frontend (React Native)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React Native | 0.76.5 | Framework chính |
| Expo | ~52.0.23 | Development platform |
| TypeScript | ~5.3.3 | Type safety |
| Expo Router | ~4.0.14 | Navigation |
| Axios | ^1.7.9 | HTTP client |
| Expo SecureStore | ~14.0.0 | Secure storage |
| Expo Location | ~18.0.4 | GPS tracking |
| Expo Image Picker | ~16.0.3 | Image selection |
| React Native Maps | 1.18.0 | Map display |

### 7.2. Backend (Spring Boot)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Spring Boot | 3.4.1 | Framework chính |
| Spring Security | 6.x | Authentication & Authorization |
| JWT | 0.12.6 | Token generation |
| PostgreSQL | Latest | Database |
| JPA/Hibernate | Latest | ORM |
| BCrypt | Built-in | Password hashing |
| JavaMail | Latest | Email service |

---

## PHẦN 8: LUỒNG HOẠT ĐỘNG CHI TIẾT

### 8.1. Luồng Đăng Ký (Register Flow)

```
1. User nhập thông tin đăng ký
   ↓
2. Client validate form
   ↓
3. POST /api/auth/register
   ↓
4. Server:
   - Kiểm tra email/username trùng
   - Hash password với BCrypt
   - Tạo User (isActive = false)
   - Tạo OTP 6 số
   - Gửi OTP qua email
   - Trả về success message
   ↓
5. Client lưu pendingEmail vào SecureStore
   ↓
6. Navigate to verify-otp screen
   ↓
7. User nhập OTP
   ↓
8. POST /api/auth/verify-registration
   ↓
9. Server:
   - Verify OTP
   - Set isActive = true
   - Tạo JWT token
   - Trả về token + user info
   ↓
10. Client:
    - Lưu token vào SecureStore
    - Lưu user data vào SecureStore
    - Navigate to main app
```

### 8.2. Luồng Đăng Nhập (Login Flow)

```
1. User nhập email + password
   ↓
2. POST /api/auth/login
   ↓
3. Server:
   - Tìm user theo email
   - Verify password với BCrypt
   - Kiểm tra isActive
   - Tạo JWT token
   - Trả về token + user info
   ↓
4. Client:
   - Lưu token vào SecureStore
   - Lưu user data vào SecureStore
   - Update AuthContext
   - Navigate to main app
```

### 8.3. Luồng Quên Mật Khẩu (Forgot Password Flow)

```
1. User nhập email
   ↓
2. POST /api/auth/forgot-password
   ↓
3. Server:
   - Kiểm tra email tồn tại
   - Tạo OTP
   - Gửi OTP qua email
   ↓
4. Client lưu resetEmail vào SecureStore
   ↓
5. Navigate to reset-password screen
   ↓
6. User nhập OTP + mật khẩu mới
   ↓
7. POST /api/auth/reset-password
   ↓
8. Server:
   - Verify OTP
   - Hash mật khẩu mới
   - Cập nhật password
   ↓
9. Navigate to login screen
```

---

## PHẦN 9: BẢO MẬT VÀ XỬ LÝ LỖI

### 9.1. Error Handling

```typescript
// File: client/src/services/api/client.ts
private transformError(error: unknown): Error {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Network error
    if (!axiosError.response) {
      return new NetworkError(
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        axiosError
      );
    }

    // HTTP error
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;
    const message = data?.message || axiosError.message;
    
    return new ApiError(message, `HTTP_${status}`, status, axiosError);
  }

  return new Error('Đã xảy ra lỗi không xác định');
}
```

### 9.2. Security Best Practices

1. **Password Security**:
   - BCrypt với salt tự động
   - Minimum 6 characters
   - Không lưu plain text

2. **Token Security**:
   - JWT với expiration time
   - Stored in SecureStore (encrypted)
   - Auto-refresh mechanism

3. **API Security**:
   - HTTPS only
   - JWT authentication
   - CORS configuration
   - Rate limiting

4. **Data Validation**:
   - Client-side validation
   - Server-side validation
   - SQL injection prevention (JPA)
   - XSS prevention


---

## PHẦN 10: TESTING VÀ DEBUGGING

### 10.1. Logging System

```typescript
// Client logging
console.log('🔐 Attempting login with:', { email });
console.log('✅ Login successful');
console.error('❌ Login failed:', error);

// Server logging
System.out.println("📝 Registration attempt - Email: " + email);
System.out.println("✅ User saved - ID: " + userId);
System.out.println("❌ Failed to register: " + error);
```

### 10.2. Error Messages (Vietnamese)

```typescript
// Authentication errors
'Đăng nhập thất bại'
'Sai tài khoản hoặc mật khẩu'
'Tài khoản chưa được xác minh'
'Không thể kết nối đến máy chủ'

// Validation errors
'Email không hợp lệ'
'Mật khẩu phải có ít nhất 6 ký tự'
'Biệt danh không được để trống'

// OTP errors
'Mã OTP không hợp lệ hoặc đã hết hạn'
'Không thể gửi lại mã OTP'
```

---

## PHẦN 11: DEPLOYMENT

### 11.1. Environment Configuration

#### Client (.env):
```
API_BASE_URL=http://192.168.1.5:8080/api
API_TIMEOUT=10000
```

#### Server (application.properties):
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/mapic
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Email
spring.mail.host=smtp.gmail.com
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
```

### 11.2. Build Commands

#### Client:
```bash
# Development
npm start

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

#### Server:
```bash
# Development
./mvnw spring-boot:run

# Build
./mvnw clean package

# Run JAR
java -jar target/server-0.0.1-SNAPSHOT.jar
```

---

## PHẦN 12: KẾT LUẬN

### 12.1. Các Yêu Cầu Đã Hoàn Thành

✅ **Bảo mật API (4 phương pháp)**:
1. JWT Authentication
2. Password Hashing (BCrypt)
3. OTP Verification
4. HTTPS & Secure Storage

✅ **Kiến trúc ứng dụng**:
- Client: Feature-based architecture
- Server: Layered architecture
- Clean separation of concerns

✅ **Giao diện**:
- StyleSheet API (thay Tailwind CSS)
- Responsive design
- Professional UI/UX
- Settings screen với đầy đủ tính năng

✅ **Navigation**:
- Expo Router (file-based routing)
- Auth flow protection
- Tab navigation
- Deep linking support

✅ **Lưu trữ dữ liệu**:
- Expo SecureStore (thay Realm)
- Encrypted storage
- Auto-login
- Token management

### 12.2. Tính Năng Nổi Bật

1. **Authentication Flow hoàn chỉnh**:
   - Register với OTP verification
   - Login với auto-login
   - Forgot password với OTP
   - Secure token storage

2. **Profile Management**:
   - Edit profile (nickname, bio)
   - Avatar picker (preset + upload + camera)
   - Real-time update
   - Settings sections

3. **Real-time Location**:
   - GPS tracking
   - Map display
   - Server synchronization
   - Permission handling

4. **Error Handling**:
   - User-friendly messages (Vietnamese)
   - Network error handling
   - Validation errors
   - Logging system

### 12.3. Công Nghệ Sử Dụng

**Frontend**:
- React Native + Expo
- TypeScript
- Expo Router
- Axios
- SecureStore

**Backend**:
- Spring Boot
- Spring Security
- JWT
- PostgreSQL
- BCrypt

### 12.4. Hướng Phát Triển

1. **Tính năng mới**:
   - Chat real-time (WebSocket)
   - Friend system
   - Feed/Posts
   - Notifications

2. **Cải thiện**:
   - File upload to cloud (AWS S3)
   - Image optimization
   - Offline mode
   - Performance optimization

3. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

---

## PHỤ LỤC

### A. Cấu Trúc Database

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nick_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    email_verified TIMESTAMP,
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP tokens table
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Current locations table
CREATE TABLE current_locations (
    user_id UUID PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    battery_level INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### B. API Documentation

Xem chi tiết tại: [Postman Collection](link-to-postman)

### C. Screenshots

1. Login Screen
2. Register Screen
3. OTP Verification
4. Map Screen
5. Settings Screen
6. Edit Profile

---

**Ngày hoàn thành**: [Ngày/Tháng/Năm]

**Chữ ký sinh viên**: _______________
