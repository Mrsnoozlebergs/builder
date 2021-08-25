import { Provide } from '@midwayjs/decorator';
import base from 'base.config.json';
import redis from 'redis';

const redisOptions = {
  port: 6379,          // Redis port
  host: '159.75.89.4',   // Redis host
  password: base.redisPassword,
  db: 0,
  detect_buffers: true
}

const options = {
  host: redisOptions.host,
  port: redisOptions.port,
  password: redisOptions.password,
  detect_buffers: redisOptions.detect_buffers, // 传入buffer 返回也是buffer 否则会转换成String
  retry_strategy: function (options: any) {
    // 重连机制
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
}

@Provide('redis')
export default class Redis {
  private client: redis.RedisClient = redis.createClient(options);

  /**
   * 设置 redis 值
   * @param key 键
   * @param value 值
   * @param expireTime 过期时间(s)
   */
  public setValue = <T>(key: string, value: T, expireTime: number = 7 * 24 * 3600) => {
    if (typeof value === 'string') {
      this.client.set(key, value)
    } else if (typeof value === 'object') {
      for (let item in value) {
        // @ts-ignore
        this.client.hmset(key, item, value[item], redis.print)
      }
    }

    this.client.expire(key, expireTime);
  }

  /**
   * 获取 内容
   * @param key 键
   */
  public getValue = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  /**
   * 获取 哈希
   * @param key 键
   */
  public getHValue = (key: string) => {
    return new Promise((resolve, reject) => {
      this.client.hgetall(key, function (err, value) {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })
    })
  }

  /**
   * 更新过期时间
   * @param key 键
   * @param expireTime 过期时间(s)
   */
  public updateExpireTime = (key: string, expireTime: number = 7 * 24 * 3600): Promise<number> => {
    return new Promise((res, rej) => {
      this.client.expire(key, expireTime, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    })
  }

  /**
   * 删除键
   * @param {string} key 键
   * @returns {number} 删除的数量
   */
  public delete = (key: string): Promise<number> => {
    return new Promise((res, rej) => {
      this.client.del(key, (err, count) => {
        if (err) {
          rej(err);
        } else {
          res(count)
        }
      });
    })
  }
}