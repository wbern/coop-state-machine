export const createWorldCoords = (options) => {
    const defaults = {
        initialSizeX: 0,
        initialSizeY: 0,
        maxSizeX: 4,
        maxSizeY: 6,
        initialFloors: 0,
        randomizeBuildings: false,
    }

    let o = { ...defaults, ...options }

    latestWorldCreationOptions = o

    let created = new Array(o.maxSizeX + o.initialSizeX)
        .fill(1, o.maxSizeX, o.maxSizeX + o.initialSizeX)
        .map((x) =>
            new Array(o.maxSizeY + o.initialSizeY)
                .fill(1, o.maxSizeY, o.maxSizeY + o.initialSizeY)
                .map(
                    (y) =>
                        // z (floors)
                        new Array(o.maxSizeZ)
                )
        )

    if (o.randomizeBuildings || o.initialFloors > 0) {
        for (
            let xIndex = o.maxSizeX;
            xIndex < o.maxSizeX + o.initialSizeX;
            xIndex++
        ) {
            for (
                let yIndex = o.maxSizeY;
                yIndex < o.maxSizeY + o.initialSizeY;
                yIndex++
            ) {
                created[xIndex][yIndex] = (o.randomizeBuildings
                    ? new Array(Math.max(Math.floor(Math.random() * 10) - 6, 0))
                    : new Array(o.initialFloors)
                )
                    .fill(1)
                    .map((z) => ({
                        type: 'buildings/buildingTiles_000.png',
                    }))
            }
        }
    }
    // created.forEach(row =>
    //     row.forEach(
    //         cell =>
    //             (cell = new Array(
    //                 Math.max(Math.floor(Math.random() * 10) - 7, 0)
    //             )
    //                 .fill(1)
    //                 .map(z => ({
    //                     type: 'buildings/buildingTiles_000.png',
    //                 })))
    //     )
    // )
    // } else if (this.initialFloors > 0) {
    //     created.forEach(row =>
    //         row.forEach(
    //             cell =>
    //                 (cell = new Array(this.initialFloors)
    //                     .fill(1)
    //                     .map(z => ({
    //                         type: 'buildings/buildingTiles_000.png',
    //                     })))
    //         )
    //     )
    // }

    return created
}

export default createWorldCoords
