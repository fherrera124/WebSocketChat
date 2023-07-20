package com.websocket.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.WebApplicationContext;



public class TestApp extends ChatApplicationTests {

    /* @Autowired
	private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

	@Before
	public void setup() {
		mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
	}

	@Test
	public void testEmployee() throws Exception {
		mockMvc.perform(get("/employee")).andExpect(status().isOk())
				.andExpect(content().contentType("application/json;charset=UTF-8"))
				.andExpect(jsonPath("$.name").value("emp1")).andExpect(jsonPath("$.designation").value("manager"))
				.andExpect(jsonPath("$.empId").value("1")).andExpect(jsonPath("$.salary").value(3000));

	} */
    
}
