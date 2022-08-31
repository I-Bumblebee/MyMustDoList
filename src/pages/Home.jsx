import React, {useState, useEffect} from "react";
import {BsSunFill, BsFillMoonFill, BsPlusCircle} from "react-icons/bs";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {FiCheckCircle, FiCircle} from "react-icons/fi";
import {HiX} from "react-icons/hi"
import {v4 as uuid} from 'uuid';


function Home() {
    const [darkMode, setDarkMode] = useState(true)
    const [newTask, setNewTask] = useState("")
    const [tasks, setTasks] = useState([])
    const [redo, setRedo] = useState(false)
    const [filterF, setFilterF] = useState({f: (t) => true, mode: "All"})
    const [canSubmit, setCanSubmit] = useState(false);
    const viewportNode = document.getElementById('viewport') // container aligned in the middle

    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        // return () => {
        //     window.removeEventListener("scroll", handleScroll);
        // };
    }, []);

    useEffect(() => {
        if (!canSubmit) return;
        const tmp = tasks.map(({task, id, d}) => {
            return {
                task: task,
                id: id,
                d: d,
            }
        })
        localStorage.setItem('tasks', JSON.stringify(tmp));
        setCanSubmit(false);
    }, [tasks]);

    useEffect(() => {
        const taskss = JSON.parse(localStorage.getItem('tasks'));

        if (taskss) {
            (async () => {
                const tmp = await taskss.map(({task, id, d}) => {
                    let new1 = {
                        task: task, id: id, d: d, setD: (newState) => {
                            (() => new1['d'] = !new1['d'])()
                        }
                    };
                    return new1
                })
                setTasks(tmp);
            })()

        }
    }, []);


    const addTask = () => {
        if (newTask === "") return;
        let new1 = {
            task: newTask, id: uuid().slice(0, 8), d: false, setD: (newState) => {
                (() => new1['d'] = !new1['d'])()
            }
        };
        setTasks([...tasks, new1])
        setNewTask("")
        setCanSubmit(true)
    }

    useEffect(() => {
        setTasks([...tasks])
    }, [redo]);

    const deleteTask = (providedID) => {
        const tmp = tasks.filter(({id}) => id !== providedID);
        setTasks(tmp);
        setCanSubmit(true);
    }

    function handleOnDragEnd(result) {
        if (!result.destination) return;

        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setTasks(items);
        setCanSubmit(true);
    }

    return (
        <div className="flex relative">
            <div className={`w-full min-h-screen h-auto ${darkMode ? "bg-[#161722]" : "bg-[#fafafa]"} px-auto `}>
                <div
                    className={` ${
                        darkMode
                            ? "bg-[url('./img/bg-mobile-dark.jpg')] lg:bg-[url('./img/bg-desktop-dark.jpg')]"
                            : "bg-[url('./img/bg-mobile-light.jpg')] lg:bg-[url('./img/bg-desktop-light.jpg')]"
                    } w-full  h-[260px] 2xl:h-[300px] bg-cover absolute top-0 z-[0]`}
                ></div>
                <div className="lg:w-[38%]  w-[90%] h-auto mx-auto lg:mt-12 mt-[12%] z-[100]">
                    <div className="w-full flex flex-row justify-between px-5 pr-7 lg:px-0 lg:pr-3">
                        <h1 className="text-white font-josefin font-bold text-4xl z-[1]">
                            Must DO
                        </h1>
                        <button onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? (
                                <BsSunFill className="fill-white lg:scale-[2.5] scale-[2]"/>
                            ) : (
                                <BsFillMoonFill className="fill-white lg:scale-[2.5] scale-[2]"/>
                            )}
                        </button>
                    </div>
                    <div className=" mt-8 flex justify-center align-middle items-center h-[50px]">
                        <div
                            className={`w-14 h-full rounded-l-md ${darkMode ? "bg-[#393a4c]" : "bg-white/60 "} flex justify-center align-middle z-[11]`}>
                            <button onClick={addTask}>
                                <BsPlusCircle className="hover:fill-cyan-500 fill-[#777a92] scale-150 "/>
                            </button>
                        </div>
                        <input type="text"
                               value={newTask}
                               onChange={(e) => setNewTask(e.target.value)}
                               placeholder={"Create a new todo..."}
                               className={`outline-0 px-2 py-1 ${darkMode ? "bg-[#25273c] text-[#cacde8]" : "bg-white text-[#4d5066]"} w-full 
                                     text-[18px] font-sans h-full rounded-r-md z-[11]`}
                        />
                    </div>
                    <div className={"flex flex-col  justify-between lg:mb-[-60px] mt-4 drop-shadow-2xl shadow-lg"}
                         id={"viewport"}>
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                            <Droppable droppableId="characters">
                                {(provided) => (
                                    <ul className={"characters"} {...provided.droppableProps} ref={provided.innerRef}>
                                        {tasks.filter(filterF.f).map(({task, id, d, setD}, index) => {
                                            return (
                                                <Draggable key={id} draggableId={id} index={index}>
                                                    {(provided, snapshot) => {
                                                        if (snapshot.isDragging) {
                                                            provided.draggableProps.style['left'] = provided.draggableProps.style.left - (viewportNode.offsetLeft);
                                                            provided.draggableProps.style['top'] = provided.draggableProps.style.top - (viewportNode.offsetTop - scrollPosition);
                                                        }
                                                        return (<li className="w-full mx-auto"
                                                                    {...provided.dragHandleProps} {...provided.draggableProps}
                                                                    ref={provided.innerRef}
                                                            >
                                                                <div
                                                                    className={` flex justify-center align-middle items-center h-[50px]`}>
                                                                    <div
                                                                        className={`${index === 0 ? "rounded-tl-md" : ""}  w-14 h-full ${darkMode ? "bg-[#393a4c]" : "bg-gray-100 bg-gradient-to-l from-gray-200"} flex justify-center align-middle z-[11]`}>
                                                                        <button onClick={() => {
                                                                            (() => setRedo(!redo))();
                                                                            setD(!d);
                                                                            setCanSubmit(true)
                                                                        }}
                                                                        >
                                                                            {d ?
                                                                                <FiCheckCircle
                                                                                    className={` ${darkMode ? "stroke-indigo-400" : "stroke-cyan-500"} scale-150 `}/>
                                                                                :
                                                                                <FiCircle
                                                                                    className={` ${darkMode ? "hover:stroke-indigo-300" : "hover:stroke-cyan-400"} stroke-[#777a92] scale-150 `}/>
                                                                            }
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        className={` ${index === 0 ? "rounded-tr-md" : ""} justify-between outline-0 px-2 py-3 ${darkMode ? "bg-[#25273c] text-[#cacde8]" : "bg-white ext-[#4d5066]"} ${d ? "line-through text-[#777a92]" : ""} w-full text-[18px] font-sans h-full  z-[11] flex`}
                                                                    >
                                                                        {task}
                                                                        <button onClick={() => deleteTask(id)}
                                                                                className="mr-2 hover:scale-150 transition duration-100"><HiX/></button>
                                                                    </div>
                                                                </div>
                                                                <hr className="border-1 border-[#484b6a]"/>
                                                            </li>
                                                        );
                                                    }}

                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </ul>
                                )}

                            </Droppable>
                        </DragDropContext>
                        <div
                            className={`lg:px-3 w-full px-5  h-[60px] text-[#4d5066] flex flex-row  justify-between items-center text-[18px] ${tasks.filter(filterF.f).length === 0 ? "rounded-md" : "rounded-b-md"}  ${darkMode ? "bg-[#25273c]" : "bg-white"}`}>
                            <div className=" ">{tasks.filter((t) => !t.d).length} tasks left</div>
                            <div className="scale-0 w-0 lg:w-auto lg:scale-100 flex flex-row justify-between ">
                                <button onClick={() => {
                                    (() => setRedo(!redo))();
                                    setFilterF({f: (t) => true, mode: "All"})
                                }}
                                        className={`${filterF.mode === "All" ? "text-cyan-500" : "text-[#4d5066]"} mr-2 ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                                >
                                    All
                                </button>
                                <button onClick={() => {
                                    (() => setRedo(!redo))();
                                    setFilterF({f: (t) => !t.d, mode: "Active"})
                                }}
                                        className={`${filterF.mode === "Active" ? "text-cyan-500" : "text-[#4d5066]"} mr-2 ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                                >
                                    Active
                                </button>
                                <button onClick={() => {
                                    (() => setRedo(!redo))();
                                    setFilterF({f: (t) => t.d, mode: "Completed"})
                                }}
                                        className={`${filterF.mode === "Completed" ? "text-cyan-500" : "text-[#4d5066]"} ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                                >
                                    Completed
                                </button>
                            </div>
                            <button onClick={() => {
                                setTasks(tasks.filter((t) => !t.d));
                                setCanSubmit(true)
                            }} className={`${darkMode ? "hover:text-[#fafafa]" : "hover:text-black "}`}>Clear
                                Completed
                            </button>
                        </div>

                    </div>
                    <div
                        className={`font-semibold shadow-2xl justify-between px-14 mt-4  mb-12  scale-100 lg:scale-0 w-full h-[60px] text-[#4d5066] flex flex-row items-center text-[18px] rounded-md ${darkMode ? "bg-[#25273c]" : "bg-white"} `}>
                        <button onClick={() => {
                            (() => setRedo(!redo))();
                            setFilterF({f: (t) => true, mode: "All"})
                        }}
                                className={` ${filterF.mode === "All" ? "text-cyan-600 " : "text-[#4d5066]"} ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                        >
                            All
                        </button>
                        <button onClick={() => {
                            (() => setRedo(!redo))();
                            setFilterF({f: (t) => !t.d, mode: "Active"})
                        }}
                                className={`${filterF.mode === "Active" ? "text-cyan-600" : "text-[#4d5066]"}  ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                        >
                            Active
                        </button>
                        <button onClick={() => {
                            (() => setRedo(!redo))();
                            setFilterF({f: (t) => t.d, mode: "Completed"})
                        }}
                                className={`${filterF.mode === "Completed" ? "text-cyan-600" : "text-[#4d5066]"} ${darkMode ? "hover:text-[#fafafa]" : "hover:text-black"}`}
                        >
                            Completed
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Home;
