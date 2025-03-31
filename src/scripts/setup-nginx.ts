// import { exec } from 'child_process';
// import { promisify } from 'util';
// import fs from 'fs/promises';

// const execAsync = promisify(exec);

// async function setupNginx(domain: string, port: number, ssl: boolean) {
//   try {
//     // 生成 Nginx 配置
//     const config = {};//generateNginxConfig(domain, port, ssl);
    
//     // 写入配置文件
//     await fs.writeFile(
//       `/etc/nginx/conf.d/${domain}.conf`,
//       config
//     );

//     // 测试配置
//     await execAsync('nginx -t');
    
//     // 重启 Nginx
//     await execAsync('systemctl restart nginx');

//     // 如果启用 SSL，配置证书
//     if (ssl) {
//       await execAsync(`certbot --nginx -d ${domain} -d www.${domain}`);
//     }

//     return { success: true };
//   } catch (error) {
//     console.error('Nginx setup failed:', error);
//     return { success: false, error };
//   }
// } 