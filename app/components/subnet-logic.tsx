export interface SubnetRequest {
    id: string;
    name: string;
    hosts: number;
}

export interface SubnetResult {
    name: string;
    type: 'HOST' | 'LINK';
    hostsRequested: number;
    allocSize: number;
    prefix: number;
    networkIP: string;
    routerIP: string;
    broadcastIP: string;
    rangeStart: string;
    rangeEnd: string;
    mask: string;
    offset: number;
}

// ---------------- Helpers ----------------

function ipToLong(ip: string): number {
    const [a, b, c, d] = ip.split('.').map(Number);
    return (((a << 24) >>> 0) | (b << 16) | (c << 8) | d) >>> 0;
}

function longToIp(n: number): string {
    return [
        (n >>> 24) & 0xff,
        (n >>> 16) & 0xff,
        (n >>> 8) & 0xff,
        n & 0xff,
    ].join('.');
}

function calcBlockSize(hosts: number): number {
    const  needed = hosts + 3; 
    let size = 1;
    while (size < needed) size <<= 1;
    return size < 4 ? 4 : size;
}

function calcPrefix(blockSize: number): number {
    return 32 - Math.log2(blockSize);
}

function getMask(prefix: number): string {
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    return longToIp(mask);
}

// ---------------- Interval Logic ----------------

type Interval = {
    start: number;
    end: number; // [start, end)
};

type CalcItem = {
    name: string;
    hosts: number;
    type: 'HOST' | 'LINK';
    blockSize: number;
    offset: number | null;
};

// ---------------- Main Logic ----------------

export function calculateVLSM(
    baseIP: string,
    basePrefix: number,
    subnets: SubnetRequest[],
    linksCount: number
) {
    // 1. Prepare items
    const items: CalcItem[] = [];

    for (const s of subnets) {
        if (!s.name || s.hosts <= 0) continue;

        items.push({
            name: s.name,
            hosts: s.hosts,
            type: 'HOST',
            blockSize: calcBlockSize(s.hosts),
            offset: null,
        });
    }

    for (let i = 0; i < linksCount; i++) {
        items.push({
            name: `Z${i + 1}`,
            hosts: 2,
            type: 'LINK',
            blockSize: 4,
            offset: null,
        });
    }

    // 2. Sort ONLY by block size (same as C)
    items.sort((a, b) => b.blockSize - a.blockSize);

    // 3. Normalize base network
    const baseLong = ipToLong(baseIP);
    const baseMask = (0xffffffff << (32 - basePrefix)) >>> 0;
    const networkBase = (baseLong & baseMask) >>> 0;

    const totalCapacity = Math.pow(2, 32 - basePrefix);
    let maxOffsetUsed = 0;

    for (const item of items) {
        if (item.offset !== null) {
            maxOffsetUsed = Math.max(maxOffsetUsed, item.offset + item.blockSize);
        }
    }
    // 4. Free intervals
    const freeIntervals: Interval[] = [
        { start: 0, end: totalCapacity }
    ];

    // 5. Place items 
    for (const item of items) {
        const bs = item.blockSize;
        let placed = false;

        for (let i = 0; i < freeIntervals.length && !placed; i++) {
            const interval = freeIntervals[i];

            let aligned = interval.start;
            if (aligned % bs !== 0) {
                aligned = Math.ceil(aligned / bs) * bs;
            }

            if (aligned + bs > interval.end) continue;

            // place
            item.offset = aligned;
            placed = true;

            const oldStart = interval.start;
            const oldEnd = interval.end;

            freeIntervals.splice(i, 1);

            if (oldStart < aligned) {
                freeIntervals.push({ start: oldStart, end: aligned });
            }
            if (aligned + bs < oldEnd) {
                freeIntervals.push({ start: aligned + bs, end: oldEnd });
            }

            // keep deterministic order
            freeIntervals.sort((a, b) => a.start - b.start);
        }

        if (!placed) {
            console.warn(`Failed to place subnet ${item.name}`);
        }
    }

    // 6. Produce results
    const results: SubnetResult[] = [];

    for (const item of items) {
        if (item.offset === null) continue;

        const networkLong = networkBase + item.offset;
        const prefix = calcPrefix(item.blockSize);

        results.push({
            name: item.name,
            type: item.type,
            hostsRequested: item.hosts,
            allocSize: item.blockSize,
            prefix,
            networkIP: longToIp(networkLong),
            routerIP: longToIp(networkLong + 1),
            broadcastIP: longToIp(networkLong + item.blockSize - 1),
            rangeStart: longToIp(networkLong + 2),
            rangeEnd:
                item.type === 'LINK'
                    ? longToIp(networkLong + 2)
                    : longToIp(networkLong + item.blockSize - 2),
            mask: getMask(prefix),
            offset: item.offset,
        });
    }

    return {
        results,
        totalUsed: maxOffsetUsed
    };
}
