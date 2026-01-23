class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    this.token = null;
  }

  // ...rest of your methods
}

export default new ApiService();
