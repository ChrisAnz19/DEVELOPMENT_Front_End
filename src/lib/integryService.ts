import { IntegryJS } from '@integry/sdk';
import { getApiUrl } from '../config/api';

interface IntegryConfig {
  appKey: string;
  userId: string;
  hash: string;
}

class IntegryService {
  private integry: any = null;
  private isInitialized = false;

  async initialize(userId: string): Promise<void> {
    console.log('🔧 IntegryService.initialize called with userId:', userId);
    
    if (this.isInitialized && this.integry) {
      console.log('✅ Already initialized, skipping');
      return;
    }

    try {
      console.log('📡 Generating hash from server...');
      // Generate hash from server
      const response = await fetch(getApiUrl('/api/integry/hash'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      console.log('📡 Hash response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to generate hash: ${response.status}`);
      }

      const { hash } = await response.json();
      console.log('🔑 Hash generated successfully:', hash.substring(0, 10) + '...');

      console.log('🚀 Creating IntegryJS instance...');
      // Initialize Integry SDK
      this.integry = new IntegryJS({
        appKey: '95f55f66-1dbc-4461-b9cf-9094c8e2b4d6',
        hash,
        user: {
          userId: userId,
        },
        options: {
          title: "Integrations",
          tags: [],
          debug: true, // Enable debug mode
        },
      });

      this.isInitialized = true;
      console.log('✅ Integry SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Integry SDK:', error);
      throw error;
    }
  }

  async connectApp(appName: string): Promise<string> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      const connectedAccountId = await this.integry.connectApp(appName);
      return connectedAccountId;
    } catch (error) {
      console.error(`Failed to connect ${appName}:`, error);
      throw error;
    }
  }

  async disconnectApp(appName: string, connectedAccountId?: string): Promise<void> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      await this.integry.disconnectApp(appName, connectedAccountId);
    } catch (error) {
      console.error(`Failed to disconnect ${appName}:`, error);
      throw error;
    }
  }

  async isAppConnected(appName: string): Promise<boolean> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      return await this.integry.isAppConnected(appName);
    } catch (error) {
      console.error(`Failed to check connection status for ${appName}:`, error);
      return false;
    }
  }

  async getConnectedAccounts(appName: string): Promise<any[]> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      const result = await this.integry.getConnectedAccounts(appName);
      return result.connected_accounts || [];
    } catch (error) {
      console.error(`Failed to get connected accounts for ${appName}:`, error);
      return [];
    }
  }

  async invokeFunction(functionName: string, params: any, connectedAccountId?: string): Promise<any> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      console.log(`🔧 Invoking function: ${functionName} with params:`, params);
      const result = await this.integry.invokeFunction(functionName, params, connectedAccountId);
      console.log(`✅ Function ${functionName} result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to invoke function ${functionName}:`, error);
      throw error;
    }
  }

  async getFunction(functionName: string): Promise<any> {
    if (!this.integry) {
      throw new Error('Integry SDK not initialized');
    }

    try {
      return await this.integry.getFunction(functionName);
    } catch (error) {
      console.error(`Failed to get function ${functionName}:`, error);
      throw error;
    }
  }

  onAppConnected(callback: (data: any) => void): void {
    if (this.integry?.eventEmitter) {
      this.integry.eventEmitter.on('app-connected', callback);
    }
  }

  onAppDisconnected(callback: (data: any) => void): void {
    if (this.integry?.eventEmitter) {
      this.integry.eventEmitter.on('app-disconnected', callback);
    }
  }

  removeEventListener(event: string, callback: (data: any) => void): void {
    if (this.integry?.eventEmitter) {
      this.integry.eventEmitter.unsub(event);
    }
  }
}

// Export singleton instance
export const integryService = new IntegryService();
export default integryService;
