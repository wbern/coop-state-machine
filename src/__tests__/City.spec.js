import { mount } from '@vue/test-utils'
import City from '../City.vue'

const printGrid = (points, cols = 6, rows = 6) => {
    if (
        !Array.isArray(points) &&
        points &&
        typeof points.x === 'number' &&
        typeof points.x === 'number'
    ) {
        points = [points]
    }

    let res = ''

    let arr = new Array(cols).fill(1).map((undefined, y) => {
        res += '\n'
        return new Array(rows).fill(1).map((undefined, x) => {
            let foundPoint = points.find(
                point => point.x === x && point.y === y
            )
            if (foundPoint) {
                res += foundPoint.type || 'X'
            } else {
                res += '-'
            }
            // z (floors)
            // return new Array(this.initialFloors).fill(1).map(z => ({
            //     type: 'buildings/buildingTiles_000.png',
            // }))
        })
    })

    console.log(res)
}

describe('basic', () => {
    test('is a Vue instance', () => {
        const wrapper = mount(City)
        expect(wrapper.isVueInstance()).toBeTruthy()
    })
})

describe('grid conversions', () => {
    test('invalid space', () => {
        const wrapper = mount(City)
        // printGrid({ x: 1, y: 0, type: 'X' })
        expect(() => wrapper.vm.gridToCoords(1, 0)).toThrow()
        expect(() => wrapper.vm.gridToCoords(3, 0)).toThrow()
    })

    test('valid, even spaces', () => {
        const wrapper = mount(City)
        expect(wrapper.vm.gridToCoords(0, 0)).toEqual({ x: 0, y: 0 })
        expect(wrapper.vm.gridToCoords(2, 0)).toEqual({ x: 1, y: 0 })
        expect(wrapper.vm.gridToCoords(2, 2)).toEqual({ x: 1, y: 2 })
    })

    test('valid, odd spaces', () => {
        const wrapper = mount(City)
        expect(wrapper.vm.gridToCoords(1, 1)).toEqual({ x: 0, y: 1 })
        expect(wrapper.vm.gridToCoords(3, 1)).toEqual({ x: 1, y: 1 })
    })
})

describe('find spaces in use', () => {
    test('simple', () => {
        const wrapper = mount(City)

        wrapper.vm.coordsData[0][0][0] = { type: 'hello' }
        expect(wrapper.vm.floorSpaceInUse({ x: 0, y: 0 })).toBeTruthy()

        wrapper.vm.coordsData[5][5][0] = { type: 'hello' }
        expect(wrapper.vm.floorSpaceInUse({ x: 5, y: 5 })).toBeTruthy()
    })

    test('with grid conversion', () => {
        const wrapper = mount(City)

        wrapper.vm.coordsData[0][0][0] = { type: 'hello' }
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.gridToCoords(0, 0))
        ).toBeTruthy()

        wrapper.vm.coordsData[0][1][0] = { type: 'hello' }
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.gridToCoords(0, 2))
        ).toBeFalsy()
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.gridToCoords(1, 1))
        ).toBeTruthy()

        wrapper.vm.coordsData[1][2][0] = { type: 'hello' }
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.gridToCoords(2, 2))
        ).toBeTruthy()

        wrapper.vm.coordsData[1][4][0] = { type: 'hello' }
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.gridToCoords(2, 4))
        ).toBeTruthy()
    })

    describe('find buildings with multiple floors', () => {
        test('simple', () => {
            const wrapper = mount(City)

            wrapper.vm.coordsData[0][4] = new Array(5).fill({ type: 'hello' })
            expect(wrapper.vm.stackSpaceInUse(0, 1)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 2)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 3)).toBeTruthy()
        })
        test('detects two overlapping buildings and takes the front one', () => {
            const wrapper = mount(City)

            let back = new Array(5).fill({ type: 'hello' })
            wrapper.vm.coordsData[0][4] = back
            let front = new Array(10).fill({ type: 'hello' })
            wrapper.vm.coordsData[0][6] = front

            expect(wrapper.vm.findStackSpaceCoords(0, 1).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 2).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 3).value).toBe(front[0])
        })
    })

    describe('z-indexing', () => {
        test('simple', () => {
            const wrapper = mount(City)

            wrapper.vm.coordsData[0][4] = new Array(5).fill({ type: 'hello' })
            expect(wrapper.vm.stackSpaceInUse(0, 1)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 2)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 3)).toBeTruthy()
        })
        test('z-index correctly showing on div elements', () => {
            const wrapper = mount(City, {
                propsData: {
                    initialFloors: 0,
                },
            })

            wrapper.vm.coordsData[0][6] = new Array(7).fill({ type: 'hello' })
            wrapper.vm.$forceUpdate()

            let lower = wrapper.find('[x="0"][y="4"] > div')
            let higher = wrapper.find('[x="0"][y="3"] > div')
            let highest = wrapper.find('[x="0"][y="0"] > div')

            expect(lower).not.toBe(null)
            expect(higher).not.toBe(null)
            expect(highest).not.toBe(null)

            expect(lower.element.style.zIndex).not.toBeNaN()
            expect(higher.element.style.zIndex).not.toBeNaN()
            expect(highest.element.style.zIndex).not.toBeNaN()

            expect(Number(lower.element.style.zIndex)).toBeLessThan(
                Number(higher.element.style.zIndex)
            )

            expect(Number(lower.element.style.zIndex)).toBeLessThan(
                Number(highest.element.style.zIndex)
            )

            expect(Number(higher.element.style.zIndex)).toBeLessThan(
                Number(highest.element.style.zIndex)
            )
        })
        test('detects two overlapping buildings and takes the front one', () => {
            const wrapper = mount(City)

            let back = new Array(5).fill({ type: 'hello' })
            wrapper.vm.coordsData[0][4] = back
            let front = new Array(10).fill({ type: 'hello' })
            wrapper.vm.coordsData[0][6] = front

            expect(wrapper.vm.findStackSpaceCoords(0, 1).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 2).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 3).value).toBe(front[0])
        })
    })
})
