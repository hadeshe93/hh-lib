import net from 'net';

/**
私有IP：A类  10.0.0.0-10.255.255.255
       A    100.64.0.0/10
       B类  172.16.0.0-172.31.255.255
       C类  192.168.0.0-192.168.255.255
       另外 还有 127.x.x.x 这个网段是环回地址
**/

const ABegin = getIpNum('100.64.0.0');
const AEnd = getIpNum('100.127.255.255');
const aBegin = getIpNum('10.0.0.0');
const aEnd = getIpNum('10.255.255.255');
const a2Begin = getIpNum('9.0.0.0');
const a2End = getIpNum('9.255.255.255');
const a3Begin = getIpNum('11.0.0.0');
const a3End = getIpNum('11.255.255.255');
const bBegin = getIpNum('172.16.0.0');
const bEnd = getIpNum('172.31.255.255');
const cBegin = getIpNum('192.168.0.0');
const cEnd = getIpNum('192.168.255.255');

const xBegin = getIpNum('127.0.0.0');
const xEnd = getIpNum('127.255.255.255');

export default function isInnerIp(ipAddress) {
  return Boolean(getInnerIpType(ipAddress));
}

function getInnerIpType(ipAddress) {
  if (typeof ipAddress !== 'string') {
    return '';
  }

  // ipv4 in ipv6
  if (ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.substr(7);
  }

  if (!net.isIPv4(ipAddress)) {
    return '';
  }

  const ipNum = getIpNum(ipAddress);

  if (isInner(ipNum, xBegin, xEnd)) {
    return '127.0.0.1';
  }

  if (isInner(ipNum, ABegin, AEnd)) {
    return 'A';
  }

  if (isInner(ipNum, aBegin, aEnd)) {
    return 'a';
  }

  if (isInner(ipNum, a2Begin, a2End)) {
    return 'a2';
  }

  if (isInner(ipNum, a3Begin, a3End)) {
    return 'a3';
  }

  if (isInner(ipNum, bBegin, bEnd)) {
    return 'b';
  }

  if (isInner(ipNum, cBegin, cEnd)) {
    return 'c';
  }

  return '';
}

function getIpNum(ipAddress) {
  const ip = ipAddress.split('.');
  const a = parseInt(ip[0], 10);
  const b = parseInt(ip[1], 10);
  const c = parseInt(ip[2], 10);
  const d = parseInt(ip[3], 10);

  const res = a * 256 * 256 * 256 + b * 256 * 256 + c * 256 + d;
  return res;
}

function isInner(userIp, begin, end) {
  return userIp >= begin && userIp <= end;
}
