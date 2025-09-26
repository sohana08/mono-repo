import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isNil } from 'lodash';


@Injectable()
export class ApiConfigService {
  constructor(private readonly config: ConfigService) { }

  /** ---------- helpers ---------- */
  private getRaw(key: string): string {
    const val = this.config.get<string>(key);
    if (isNil(val)) {
      throw new Error(`${key} environment variable is not set`);
    }
    return val;
  }

  private getString(key: string): string {
    return this.getRaw(key).replaceAll('\\n', '\n');
  }

  private getNumber(key: string): number {
    const v = this.getRaw(key);
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error(`${key} environment variable is not a number`);
    }
    return n;
  }

  private getBoolean(key: string): boolean {
    const v = this.getRaw(key);
    try {
      // accepts: true/false/"true"/"false"/1/0
      return typeof v === 'boolean' ? v : Boolean(JSON.parse(v));
    } catch {
      throw new Error(`${key} environment variable is not a boolean`);
    }
  }

  /** ---------- global flags ---------- */
  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  /** ---------- app ---------- */
  get app() {
    return {
      port: this.getNumber('PORT'),
    };
  }

  /** ---------- documentation ---------- */
  get documentationEnabled(): boolean {
    // Enable documentation in development by default
    return this.isDevelopment;
  }

  /** ---------- database (MySQL / TypeORM) ---------- */
  get mysqlConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      name: 'default',
      // keepConnectionAlive: !this.isTest,
      dropSchema: this.isTest,
      // entities,
      // migrations,
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      migrationsRun: true,
      logging: this.getBoolean('ENABLE_ORM_LOGS'),
    };
  }

  /** ---------- Redis (shared) ---------- */
  get redis() {
    return {
      enabled: this.getBoolean('REDIS_CACHE_ENABLED'),
      host: this.getString('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
    };
  }

  /** ---------- AWS S3 / MinIO (shared) ---------- */
  get s3() {
    return {
      bucketRegion: this.getString('S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('S3_API_VERSION'),
      bucketName: this.getString('S3_BUCKET_NAME'),
      bucketEndpoint: this.getString('S3_BUCKET_ENDPOINT'),
      accessKeyId: this.getString('ACCESS_KEY_ID'),
      secretAccessKey: this.getString('SECRET_ACCESS_KEY'),
      usePathStyle: this.getBoolean('AWS_USE_PATH_STYLE_ENDPOINT'),
    };
  }

  /** ---------- Email (shared) ---------- */
  get email() {
    return {
      host: this.getString('EMAIL_HOST'),
      port: this.getNumber('EMAIL_PORT'),
      username: this.getString('EMAIL_USER'),
      password: this.getString('EMAIL_PASSWORD'),
      fromName: this.getString('EMAIL_FROM_NAME'),
      from: this.getString('EMAIL_FROM'),
      secure: this.getBoolean('EMAIL_SECURE'),
    };
  }

  /** ---------- NATS (optional) ---------- */
  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED');
  }
  get nats() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  /** ---------- Auth/JWT (optional) ---------- */
  get auth() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  /** ---------- Internal services (optional) ---------- */
  get tcpTransportPort() {
    return { port: this.getNumber('TRANSPORT_PORT') };
  }

  /** ---------- External: Data Hub (optional) ---------- */
  get dataHub() {
    return {
      baseUrl: this.getString('DATA_HUB_API_BASE_URL'),
      grantType: this.getString('DATA_HUB_API_GRANT_TYPE'),
      clientId: this.getString('DATA_HUB_API_CLIENT_ID'),
      clientSecret: this.getString('DATA_HUB_API_CLIENT_SECRET'),
      accessTokenUrl: this.getString('DATA_HUB_API_ACCESS_TOKEN_ENDPOINT'),
      individualStatusUpdateUrl: this.getString('DATA_HUB_API_UPDATE_INDIVIDUAL'),
      groupStatusUpdateUrl: this.getString('DATA_HUB_API_UPDATE_GROUP'),
      dataCorrectionUrl: this.getString('DATA_HUB_API_UPDATE_INFO'),
      workerStatusUpdateUrl: this.getString('DATA_HUB_API_WORKER_STATUS'),
    };
  }
}


