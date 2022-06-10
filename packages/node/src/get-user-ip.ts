import { Socket } from 'net';

/**
 * 获取请求 ip 地址
 * @param socket
 * @param headers
 * @returns
 */
export function getUserIp(socket: Socket, headers: any) {
  if (!socket || !headers) return '';

  let userIp: string = socket.remoteAddress || '';
  const xff: string = headers['x-forwarded-for'];

  if (xff && userIp) {
    const lastXff = xff.split(',').slice(-1)[0] || '';
    userIp = lastXff.trim() || userIp;
  }

  // ipv4 in ipv6
  if (userIp.startsWith('::ffff:')) {
    userIp = userIp.substr(7);
  }

  return userIp;
}
