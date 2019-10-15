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

        wrapper.vm.worldCoords = new Array(1).fill(new Array(1).fill(new Array(1).fill({})))

        // printGrid({ x: 1, y: 0, type: 'X' })
        expect(() => wrapper.vm.screenToWorldCoords(1, 0)).toThrow()
        expect(() => wrapper.vm.screenToWorldCoords(3, 0)).toThrow()
    })

    test('valid, even spaces', () => {
        const wrapper = mount(City)

        wrapper.vm.worldCoords = new Array(1).fill(new Array(1).fill(new Array(1).fill({})))

        expect(wrapper.vm.screenToWorldCoords(0, 0)).toEqual({ x: 0, y: 0 })
        expect(wrapper.vm.screenToWorldCoords(2, 0)).toEqual({ x: 1, y: 0 })
        expect(wrapper.vm.screenToWorldCoords(2, 2)).toEqual({ x: 1, y: 2 })
    })

    test('valid, odd spaces', () => {
        const wrapper = mount(City)

        wrapper.vm.worldCoords = new Array(1).fill(new Array(1).fill(new Array(1).fill({})))

        expect(wrapper.vm.screenToWorldCoords(1, 1)).toEqual({ x: 0, y: 1 })
        expect(wrapper.vm.screenToWorldCoords(3, 1)).toEqual({ x: 1, y: 1 })
    })
})

describe('find spaces in use', () => {
    test('simple', () => {
        const wrapper = mount(City)

        wrapper.vm.setWorldCoords({ x: 0, y: 0 }, { type: 'hello' })
        expect(wrapper.vm.floorSpaceInUse({ x: 0, y: 0 })).toBeTruthy()

        wrapper.vm.setWorldCoords({ x: 5, y: 5 }, { type: 'hello' })
        expect(wrapper.vm.floorSpaceInUse({ x: 5, y: 5 })).toBeTruthy()
    })

    test('going out of bounds', () => {
        const wrapper = mount(City)

        expect(() =>
            wrapper.vm.setWorldCoords({ x: 0, y: 0, z: 1 }, { type: 'hello' })
        ).toThrow()
    })

    test('with grid conversion', () => {
        const wrapper = mount(City)

        wrapper.vm.setWorldCoords({ x: 0, y: 0 }, { type: 'hello' })

        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.screenToWorldCoords(0, 0))
        ).toBeTruthy()

        wrapper.vm.setWorldCoords({ x: 0, y: 1 }, { type: 'hello' })
        wrapper.vm.screenToWorldCoords(0, 2)
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.screenToWorldCoords(0, 2))
        ).toBeFalsy()
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.screenToWorldCoords(1, 1))
        ).toBeTruthy()

        wrapper.vm.setWorldCoords({ x: 1, y: 2 }, { type: 'hello' })
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.screenToWorldCoords(2, 2))
        ).toBeTruthy()

        wrapper.vm.setWorldCoords({ x: 1, y: 4 }, { type: 'hello' })
        expect(
            wrapper.vm.floorSpaceInUse(wrapper.vm.screenToWorldCoords(2, 4))
        ).toBeTruthy()
    })

    describe('find buildings with multiple floors', () => {
        test('simple', () => {
            const wrapper = mount(City)

            wrapper.vm.setWorldCoords({ x: 0, y: 4 }, undefined)
            wrapper.vm.worldCoords[0][4] = new Array(5).fill({ type: 'hello' })
            expect(wrapper.vm.stackSpaceInUse(0, 1)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 2)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 3)).toBeTruthy()
        })
        test('detects two overlapping buildings and takes the front one', () => {
            const wrapper = mount(City)

            wrapper.vm.setWorldCoords({ x: 0, y: 5 }, undefined)
            let back = new Array(5).fill({ type: 'back' })
            wrapper.vm.worldCoords[0][5] = back

            wrapper.vm.setWorldCoords({ x: 0, y: 10 }, undefined)
            let front = new Array(10).fill({ type: 'front' })
            wrapper.vm.worldCoords[0][10] = front

            expect(wrapper.vm.findStackSpaceCoords(0, 1)).not.toBe(undefined)

            expect(wrapper.vm.findStackSpaceCoords(0, 1).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 2).value).toBe(front[0])
            expect(wrapper.vm.findStackSpaceCoords(0, 3).value).toBe(front[0])
        })
    })

    describe('z-indexing', () => {
        test('simple', () => {
            const wrapper = mount(City)

            wrapper.vm.setWorldCoords({ x: 0, y: 4 }, undefined)
            wrapper.vm.worldCoords[0][4] = new Array(4).fill({ type: 'hello' })
            expect(wrapper.vm.stackSpaceInUse(0, 0)).toBeTruthy()
            expect(wrapper.vm.stackSpaceInUse(0, 1)).toBeTruthy()
        })
        test('z-index correctly showing on div elements', () => {
            const wrapper = mount(City, {
                propsData: {
                    initialFloors: 0,
                },
            })

            wrapper.vm.setWorldCoords({ x: 0, y: 6 }, { type: 'hello' })
            wrapper.vm.worldCoords[0][6] = new Array(7).fill({ type: 'hello' })
            wrapper.vm.$forceUpdate()

            let lower = wrapper.find('[data-screen-x="0"][data-screen-y="4"] > div img')
            let higher = wrapper.find('[data-screen-x="0"][data-screen-y="3"] > div img')
            let highest = wrapper.find('[data-screen-x="0"][data-screen-y="0"] > div img')

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
    })
})
